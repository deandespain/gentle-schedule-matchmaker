import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Caregiver, Client, ScheduleOption } from '@/types/scheduler';
import { findMatches, generateScheduleOptions } from '@/utils/scheduleMatcher';
import { Users, UserCheck, Calendar, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from "wouter";

const Index = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const storedCaregivers = localStorage.getItem('caregivers');
    const storedClients = localStorage.getItem('clients');
    const storedScheduleOptions = localStorage.getItem('scheduleOptions');
    
    if (storedCaregivers) setCaregivers(JSON.parse(storedCaregivers));
    if (storedClients) setClients(JSON.parse(storedClients));
    if (storedScheduleOptions) setScheduleOptions(JSON.parse(storedScheduleOptions));
  }, []);

  const generateSchedules = () => {
    if (caregivers.length === 0 || clients.length === 0) {
      toast({
        title: "Missing Data",
        description: "Please add at least one caregiver and one client before generating schedules.",
        variant: "destructive",
      });
      return;
    }

    const matches = findMatches(caregivers, clients);
    const options = generateScheduleOptions(matches);
    setScheduleOptions(options);
    localStorage.setItem('scheduleOptions', JSON.stringify(options));
    
    toast({
      title: "Schedules Generated",
      description: `Generated ${options.length} schedule options with ${matches.length} total matches.`,
    });
  };

  const totalMatches = scheduleOptions.reduce((total, option) => total + option.matches.length, 0);
  const bestEfficiency = scheduleOptions.length > 0 ? Math.max(...scheduleOptions.map(o => o.efficiency)) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Care Schedule Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Efficiently match caregivers with clients based on schedules, locations, and preferences
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{caregivers.length}</p>
                <p className="text-sm text-muted-foreground">Caregivers</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <UserCheck className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-muted-foreground">Clients</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{scheduleOptions.length}</p>
                <p className="text-sm text-muted-foreground">Schedule Options</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{totalMatches}</p>
                <p className="text-sm text-muted-foreground">Total Matches</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Manage Caregivers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Add caregiver information, schedules, and preferences
              </p>
              <Link href="/caregivers">
                <Button className="w-full">
                  Go to Caregivers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                Manage Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Add client information and care requirements
              </p>
              <Link href="/clients">
                <Button className="w-full">
                  Go to Clients
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Generate Schedules Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Schedule Generation
              </span>
              {bestEfficiency > 0 && (
                <span className="text-sm text-muted-foreground">
                  Best efficiency: {bestEfficiency.toFixed(1)}%
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="text-muted-foreground">
                  Generate optimal scheduling options based on your caregivers and clients
                </p>
                {scheduleOptions.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Last generated: {scheduleOptions.length} options with {totalMatches} matches
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={generateSchedules} 
                  disabled={caregivers.length === 0 || clients.length === 0}
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Schedules
                </Button>
                {scheduleOptions.length > 0 && (
                  <Link href="/schedule">
                    <Button variant="outline" size="lg">
                      View Options
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        {scheduleOptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/schedule">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Schedule Options
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Index;