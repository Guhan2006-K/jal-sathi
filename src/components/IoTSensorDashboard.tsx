import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Battery, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Zap,
  Clock,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IoTSensor {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  batteryLevel: number;
  lastReading: Date;
  currentPh: number;
  currentTurbidity: number;
  autoAlert: boolean;
  alertThreshold: {
    phMin: number;
    phMax: number;
    turbidityMax: number;
  };
}

interface SensorReading {
  sensorId: string;
  timestamp: Date;
  ph: number;
  turbidity: number;
  temperature: number;
  status: 'safe' | 'contaminated';
}

const IoTSensorDashboard = () => {
  const [sensors, setSensors] = useState<IoTSensor[]>([
    {
      id: 'sensor-001',
      name: 'Village Well Sensor A',
      location: 'Village Well A',
      status: 'online',
      batteryLevel: 85,
      lastReading: new Date(),
      currentPh: 7.2,
      currentTurbidity: 3.1,
      autoAlert: true,
      alertThreshold: { phMin: 6.5, phMax: 8.5, turbidityMax: 5 }
    },
    {
      id: 'sensor-002', 
      name: 'River Monitor B',
      location: 'River Source B',
      status: 'online',
      batteryLevel: 92,
      lastReading: new Date(Date.now() - 300000),
      currentPh: 6.8,
      currentTurbidity: 7.8,
      autoAlert: true,
      alertThreshold: { phMin: 6.5, phMax: 8.5, turbidityMax: 5 }
    },
    {
      id: 'sensor-003',
      name: 'Spring Sensor C',
      location: 'Mountain Spring C', 
      status: 'offline',
      batteryLevel: 15,
      lastReading: new Date(Date.now() - 3600000),
      currentPh: 7.8,
      currentTurbidity: 2.1,
      autoAlert: false,
      alertThreshold: { phMin: 6.5, phMax: 8.5, turbidityMax: 5 }
    }
  ]);

  const [recentReadings, setRecentReadings] = useState<SensorReading[]>([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const { toast } = useToast();

  // Simulate real-time sensor data updates
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      setSensors(prevSensors => 
        prevSensors.map(sensor => {
          if (sensor.status !== 'online') return sensor;

          // Simulate slight variations in readings
          const phVariation = (Math.random() - 0.5) * 0.4;
          const turbidityVariation = (Math.random() - 0.5) * 1.0;
          
          let newPh = sensor.currentPh + phVariation;
          let newTurbidity = Math.max(0, sensor.currentTurbidity + turbidityVariation);

          // Occasionally simulate contamination events
          if (Math.random() < 0.05) {
            newPh = Math.random() < 0.5 ? 5.2 + Math.random() : 9.1 + Math.random();
          }
          if (Math.random() < 0.03) {
            newTurbidity = 8 + Math.random() * 5;
          }

          newPh = Math.max(0, Math.min(14, newPh));
          
          const updatedSensor = {
            ...sensor,
            currentPh: Math.round(newPh * 10) / 10,
            currentTurbidity: Math.round(newTurbidity * 10) / 10,
            lastReading: new Date(),
            batteryLevel: Math.max(10, sensor.batteryLevel - (Math.random() * 0.1))
          };

          // Check for contamination and send auto-alert
          if (updatedSensor.autoAlert) {
            const isContaminated = 
              newPh < sensor.alertThreshold.phMin || 
              newPh > sensor.alertThreshold.phMax || 
              newTurbidity > sensor.alertThreshold.turbidityMax;

            if (isContaminated && !isCurrentlyContaminated(sensor)) {
              sendAutoAlert(updatedSensor, newPh, newTurbidity);
            }
          }

          return updatedSensor;
        })
      );

      // Add new reading to recent readings
      const activeSensors = sensors.filter(s => s.status === 'online');
      if (activeSensors.length > 0) {
        const randomSensor = activeSensors[Math.floor(Math.random() * activeSensors.length)];
        const isContaminated = 
          randomSensor.currentPh < randomSensor.alertThreshold.phMin ||
          randomSensor.currentPh > randomSensor.alertThreshold.phMax ||
          randomSensor.currentTurbidity > randomSensor.alertThreshold.turbidityMax;

        const newReading: SensorReading = {
          sensorId: randomSensor.id,
          timestamp: new Date(),
          ph: randomSensor.currentPh,
          turbidity: randomSensor.currentTurbidity,
          temperature: 22 + Math.random() * 8,
          status: isContaminated ? 'contaminated' : 'safe'
        };

        setRecentReadings(prev => [newReading, ...prev.slice(0, 9)]);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, sensors]);

  const isCurrentlyContaminated = (sensor: IoTSensor) => {
    return sensor.currentPh < sensor.alertThreshold.phMin || 
           sensor.currentPh > sensor.alertThreshold.phMax || 
           sensor.currentTurbidity > sensor.alertThreshold.turbidityMax;
  };

  const sendAutoAlert = (sensor: IoTSensor, ph: number, turbidity: number) => {
    toast({
      title: "🚨 AUTOMATIC CONTAMINATION ALERT",
      description: `${sensor.name}: pH ${ph}, Turbidity ${turbidity} NTU - Leader notified immediately!`,
      variant: "destructive"
    });
  };

  const toggleSensorAlert = (sensorId: string) => {
    setSensors(prev => 
      prev.map(sensor => 
        sensor.id === sensorId 
          ? { ...sensor, autoAlert: !sensor.autoAlert }
          : sensor
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4 text-safe" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-muted-foreground" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-contaminated" />;
      default: return null;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-safe';
    if (level > 20) return 'text-warning';
    return 'text-contaminated';
  };

  const onlineSensors = sensors.filter(s => s.status === 'online').length;
  const contaminatedSensors = sensors.filter(s => 
    s.status === 'online' && isCurrentlyContaminated(s)
  ).length;

  return (
    <div className="space-y-6">
      {/* IoT System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sensors</p>
                <p className="text-2xl font-bold text-primary">{onlineSensors}</p>
              </div>
              <Cpu className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contaminated</p>
                <p className="text-2xl font-bold text-contaminated">{contaminatedSensors}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-contaminated" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auto Alerts</p>
                <p className="text-2xl font-bold text-accent">
                  {sensors.filter(s => s.autoAlert).length}
                </p>
              </div>
              <Zap className="h-6 w-6 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Real-time Mode</p>
                <div className="flex items-center gap-2 mt-1">
                  <Switch 
                    checked={isRealTimeEnabled}
                    onCheckedChange={setIsRealTimeEnabled}
                  />
                  <Label className="text-xs">{isRealTimeEnabled ? 'ON' : 'OFF'}</Label>
                </div>
              </div>
              <Activity className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contamination Alerts */}
      {contaminatedSensors > 0 && (
        <Alert className="border-contaminated bg-contaminated/10">
          <AlertTriangle className="h-4 w-4 text-contaminated" />
          <AlertDescription className="text-contaminated font-medium">
            🚨 {contaminatedSensors} sensor{contaminatedSensors > 1 ? 's are' : ' is'} detecting contaminated water! 
            Automatic alerts have been sent to tribal leaders.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sensor Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              IoT Sensor Network
            </CardTitle>
            <CardDescription>
              Real-time monitoring with automatic contamination alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sensors.map((sensor) => {
              const isContaminated = isCurrentlyContaminated(sensor);
              
              return (
                <Card key={sensor.id} className={`p-4 ${isContaminated ? 'border-contaminated bg-contaminated/5' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {getStatusIcon(sensor.status)}
                          {sensor.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{sensor.location}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Last reading: {sensor.lastReading.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={sensor.status === 'online' ? 'default' : 'destructive'}>
                          {sensor.status}
                        </Badge>
                        <div className="flex items-center gap-1 mt-2">
                          <Battery className={`h-3 w-3 ${getBatteryColor(sensor.batteryLevel)}`} />
                          <span className={`text-xs ${getBatteryColor(sensor.batteryLevel)}`}>
                            {Math.round(sensor.batteryLevel)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {sensor.status === 'online' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 p-2 rounded">
                          <div className="flex justify-between text-sm">
                            <span>pH: {sensor.currentPh}</span>
                            <Badge 
                              variant={
                                sensor.currentPh >= sensor.alertThreshold.phMin && 
                                sensor.currentPh <= sensor.alertThreshold.phMax ? 'default' : 'destructive'
                              }
                              className="h-4 text-xs"
                            >
                              {sensor.currentPh >= sensor.alertThreshold.phMin && 
                               sensor.currentPh <= sensor.alertThreshold.phMax ? 'Safe' : 'Alert'}
                            </Badge>
                          </div>
                          <Progress 
                            value={(sensor.currentPh / 14) * 100} 
                            className="mt-1 h-1"
                          />
                        </div>

                        <div className="bg-muted/50 p-2 rounded">
                          <div className="flex justify-between text-sm">
                            <span>Turbidity: {sensor.currentTurbidity}</span>
                            <Badge 
                              variant={sensor.currentTurbidity < sensor.alertThreshold.turbidityMax ? 'default' : 'destructive'}
                              className="h-4 text-xs"
                            >
                              {sensor.currentTurbidity < sensor.alertThreshold.turbidityMax ? 'Safe' : 'Alert'}
                            </Badge>
                          </div>
                          <Progress 
                            value={Math.min((sensor.currentTurbidity / 10) * 100, 100)} 
                            className="mt-1 h-1"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={sensor.autoAlert}
                          onCheckedChange={() => toggleSensorAlert(sensor.id)}
                          disabled={sensor.status !== 'online'}
                        />
                        <Label className="text-sm">Auto Alert</Label>
                        {sensor.autoAlert && <Send className="h-3 w-3 text-accent" />}
                      </div>
                      
                      {isContaminated && (
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          CONTAMINATED
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Real-time Readings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Sensor Data
            </CardTitle>
            <CardDescription>
              Recent automatic readings from IoT sensors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentReadings.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for sensor data...</p>
                  <p className="text-xs">Enable real-time mode to see live readings</p>
                </div>
              ) : (
                recentReadings.map((reading, index) => {
                  const sensor = sensors.find(s => s.id === reading.sensorId);
                  return (
                    <div 
                      key={`${reading.sensorId}-${reading.timestamp.getTime()}`}
                      className={`p-3 border rounded-lg ${
                        reading.status === 'contaminated' ? 'border-contaminated/30 bg-contaminated/5' : 'border-border'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{sensor?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {reading.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge 
                          variant={reading.status === 'safe' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {reading.status === 'safe' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {reading.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">pH:</span>
                          <span className="ml-1 font-medium">{reading.ph}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Turbidity:</span>
                          <span className="ml-1 font-medium">{reading.turbidity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Temp:</span>
                          <span className="ml-1 font-medium">{reading.temperature.toFixed(1)}°C</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IoT Setup Info */}
      <Card>
        <CardHeader>
          <CardTitle>IoT Sensor Setup Guide</CardTitle>
          <CardDescription>How to connect physical sensors to JalGuard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">1. Hardware Setup</h4>
              <p className="text-sm text-muted-foreground">
                ESP32/Arduino with pH and turbidity sensors connected via Wi-Fi or LoRaWAN
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">2. Data Transmission</h4>
              <p className="text-sm text-muted-foreground">
                Sensors send readings every 5 minutes to cloud database via HTTP/MQTT
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">3. Auto Alerts</h4>
              <p className="text-sm text-muted-foreground">
                System automatically sends SMS/WhatsApp alerts when contamination detected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IoTSensorDashboard;