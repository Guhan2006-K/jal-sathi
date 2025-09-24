import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Droplets, AlertTriangle, CheckCircle } from 'lucide-react';

interface WaterSource {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'safe' | 'contaminated';
  ph: number;
  turbidity: number;
  lastTested: Date;
}

const WaterSourceMap = () => {
  const [waterSources] = useState<WaterSource[]>([
    {
      id: '1',
      name: 'Village Well A',
      latitude: 18.5204,
      longitude: 73.8567,
      status: 'safe',
      ph: 7.2,
      turbidity: 3.5,
      lastTested: new Date()
    },
    {
      id: '2',
      name: 'River Source B',
      latitude: 18.5304,
      longitude: 73.8667,
      status: 'contaminated',
      ph: 5.8,
      turbidity: 8.2,
      lastTested: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      name: 'Mountain Spring C',
      latitude: 18.5104,
      longitude: 73.8467,
      status: 'safe',
      ph: 7.8,
      turbidity: 2.1,
      lastTested: new Date(Date.now() - 7200000)
    },
    {
      id: '4',
      name: 'Pond D',
      latitude: 18.5404,
      longitude: 73.8767,
      status: 'contaminated',
      ph: 9.2,
      turbidity: 12.5,
      lastTested: new Date(Date.now() - 1800000)
    }
  ]);

  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null);

  const getStatusIcon = (status: string) => {
    return status === 'safe' ? 
      <CheckCircle className="h-4 w-4 text-safe" /> : 
      <AlertTriangle className="h-4 w-4 text-contaminated" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'safe' ? 'bg-safe' : 'bg-contaminated';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Map Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Water Sources Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted rounded-lg h-96 overflow-hidden">
            {/* Simplified map representation */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-accent/20">
              <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Interactive Map View</p>
                  <p className="text-xs">(Click markers below to see details)</p>
                </div>
              </div>
              
              {/* Water source markers */}
              {waterSources.map((source, index) => (
                <div
                  key={source.id}
                  className={`absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getStatusColor(source.status)}`}
                  style={{
                    left: `${20 + (index * 15)}%`,
                    top: `${30 + (index * 10)}%`
                  }}
                  onClick={() => setSelectedSource(source)}
                />
              ))}
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-safe"></div>
              <span className="text-sm text-muted-foreground">Safe Water</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-contaminated"></div>
              <span className="text-sm text-muted-foreground">Contaminated</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Details */}
      <Card>
        <CardHeader>
          <CardTitle>Water Source Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSource ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{selectedSource.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last tested: {selectedSource.lastTested.toLocaleString()}
                  </p>
                </div>
                <Badge variant={selectedSource.status === 'safe' ? 'default' : 'destructive'}>
                  {getStatusIcon(selectedSource.status)}
                  {selectedSource.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">pH Level</p>
                  <p className="text-xl font-bold">{selectedSource.ph}</p>
                  <p className="text-xs text-muted-foreground">Safe: 6.5 - 8.5</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Turbidity</p>
                  <p className="text-xl font-bold">{selectedSource.turbidity} NTU</p>
                  <p className="text-xs text-muted-foreground">Safe: &lt; 5 NTU</p>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">GPS Coordinates</p>
                <p className="font-mono text-sm">
                  {selectedSource.latitude.toFixed(4)}°N, {selectedSource.longitude.toFixed(4)}°E
                </p>
              </div>

              {selectedSource.status === 'contaminated' && (
                <div className="bg-contaminated/10 border border-contaminated/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-contaminated font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Contamination Alert
                  </div>
                  <p className="text-sm text-contaminated/80">
                    This water source has been identified as contaminated. 
                    Community leaders have been notified. Do not use this water for drinking.
                  </p>
                  <Button variant="destructive" size="sm" className="mt-2">
                    Send Emergency Alert
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click on a water source marker to view details</p>
            </div>
          )}

          {/* All Sources List */}
          <div className="mt-6 space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              All Water Sources
            </h4>
            {waterSources.map((source) => (
              <button
                key={source.id}
                onClick={() => setSelectedSource(source)}
                className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                  selectedSource?.id === source.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <span className="font-medium">{source.name}</span>
                  </div>
                  <Badge variant={source.status === 'safe' ? 'secondary' : 'destructive'} className="text-xs">
                    {source.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterSourceMap;