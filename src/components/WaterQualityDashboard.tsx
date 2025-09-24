import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, AlertTriangle, CheckCircle, MapPin, Phone, Activity, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WaterSourceMap from './WaterSourceMap';
import IoTSensorDashboard from './IoTSensorDashboard';

interface WaterTest {
  id: string;
  location: string;
  ph: number;
  turbidity: number;
  timestamp: Date;
  status: 'safe' | 'contaminated';
}

interface Leader {
  name: string;
  phone: string;
  village: string;
}

const WaterQualityDashboard = () => {
  const [ph, setPh] = useState<string>('');
  const [turbidity, setTurbidity] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [waterTests, setWaterTests] = useState<WaterTest[]>([
    {
      id: '1',
      location: 'Village Well A',
      ph: 7.2,
      turbidity: 3.5,
      timestamp: new Date(),
      status: 'safe'
    },
    {
      id: '2',
      location: 'River Source B',
      ph: 5.8,
      turbidity: 8.2,
      timestamp: new Date(Date.now() - 3600000),
      status: 'contaminated'
    }
  ]);

  const [leaders] = useState<Leader[]>([
    { name: 'Ravi Kumar', phone: '+91-9876543210', village: 'Village A' },
    { name: 'Priya Singh', phone: '+91-9876543211', village: 'Village B' }
  ]);

  const { toast } = useToast();

  const checkContamination = (phValue: number, turbidityValue: number): 'safe' | 'contaminated' => {
    return (phValue < 6.5 || phValue > 8.5 || turbidityValue >= 5) ? 'contaminated' : 'safe';
  };

  const sendAlert = (location: string, ph: number, turbidity: number) => {
    // Simulate sending alert to leader
    const leader = leaders[0]; // In real app, match by location
    toast({
      title: "Alert Sent!",
      description: `Contamination alert sent to ${leader.name} (${leader.phone})`,
      variant: "default"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const phValue = parseFloat(ph);
    const turbidityValue = parseFloat(turbidity);
    
    if (!phValue || !turbidityValue || !location) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const status = checkContamination(phValue, turbidityValue);
    
    const newTest: WaterTest = {
      id: Date.now().toString(),
      location,
      ph: phValue,
      turbidity: turbidityValue,
      timestamp: new Date(),
      status
    };

    setWaterTests([newTest, ...waterTests]);

    if (status === 'contaminated') {
      sendAlert(location, phValue, turbidityValue);
    }

    // Reset form
    setPh('');
    setTurbidity('');
    setLocation('');

    toast({
      title: "Test Recorded",
      description: `Water quality test for ${location} has been recorded`,
      variant: "default"
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'safe' ? 'safe' : 'contaminated';
  };

  const getPhStatus = (ph: number) => {
    if (ph >= 6.5 && ph <= 8.5) return 'safe';
    return 'contaminated';
  };

  const getTurbidityStatus = (turbidity: number) => {
    return turbidity < 5 ? 'safe' : 'contaminated';
  };

  const safeWaterSources = waterTests.filter(test => test.status === 'safe').length;
  const contaminatedSources = waterTests.filter(test => test.status === 'contaminated').length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
            <Droplets className="h-10 w-10" />
            JalGuard
          </h1>
          <p className="text-muted-foreground">Tribal Water Quality Monitoring System</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Safe Sources</p>
                  <p className="text-3xl font-bold text-safe">{safeWaterSources}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-safe" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contaminated Sources</p>
                  <p className="text-3xl font-bold text-contaminated">{contaminatedSources}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-contaminated" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sources</p>
                  <p className="text-3xl font-bold text-primary">{waterTests.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contamination Alerts */}
        {contaminatedSources > 0 && (
          <Alert className="border-contaminated bg-contaminated/10">
            <AlertTriangle className="h-4 w-4 text-contaminated" />
            <AlertDescription className="text-contaminated font-medium">
              ⚠️ {contaminatedSources} contaminated water source{contaminatedSources > 1 ? 's' : ''} detected! 
              Leaders have been notified.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="iot" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              IoT Sensors
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Water Quality Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Record New Water Test</CardTitle>
                  <CardDescription>Enter pH and turbidity measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="location">Water Source Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Village Well A"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ph">pH Level</Label>
                        <Input
                          id="ph"
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          value={ph}
                          onChange={(e) => setPh(e.target.value)}
                          placeholder="7.0"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Safe: 6.5 - 8.5</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="turbidity">Turbidity (NTU)</Label>
                        <Input
                          id="turbidity"
                          type="number"
                          step="0.1"
                          min="0"
                          value={turbidity}
                          onChange={(e) => setTurbidity(e.target.value)}
                          placeholder="3.0"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Safe: &lt; 5 NTU</p>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Record Water Test
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Tests */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Water Tests</CardTitle>
                  <CardDescription>Latest water quality measurements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {waterTests.slice(0, 5).map((test) => (
                    <div key={test.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{test.location}</h4>
                          <p className="text-sm text-muted-foreground">
                            {test.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={test.status === 'safe' ? 'default' : 'destructive'}>
                          {test.status === 'safe' ? 'Safe' : 'Contaminated'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>pH: {test.ph}</span>
                            <Badge 
                              variant={getPhStatus(test.ph) === 'safe' ? 'default' : 'destructive'}
                              className="h-5 text-xs"
                            >
                              {getPhStatus(test.ph)}
                            </Badge>
                          </div>
                          <Progress 
                            value={(test.ph / 14) * 100} 
                            className="mt-1 h-2"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Turbidity: {test.turbidity} NTU</span>
                            <Badge 
                              variant={getTurbidityStatus(test.turbidity) === 'safe' ? 'default' : 'destructive'}
                              className="h-5 text-xs"
                            >
                              {getTurbidityStatus(test.turbidity)}
                            </Badge>
                          </div>
                          <Progress 
                            value={Math.min((test.turbidity / 10) * 100, 100)} 
                            className="mt-1 h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="iot">
            <IoTSensorDashboard />
          </TabsContent>

          <TabsContent value="map">
            <WaterSourceMap />
          </TabsContent>

          <TabsContent value="contacts">
            {/* Leader Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>Local leaders to contact in case of contamination</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leaders.map((leader, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{leader.name}</h4>
                            <p className="text-sm text-muted-foreground">{leader.village}</p>
                            <p className="text-sm font-mono mt-2">{leader.phone}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Call Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WaterQualityDashboard;