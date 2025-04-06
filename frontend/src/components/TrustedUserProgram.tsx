import React, { useState, useMemo } from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface TrustedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  level: number;
  contributionScore: number;
  accuracyScore: number;
  reportsSubmitted: number;
  reportsAccepted: number;
  lastActive: string;
  status: 'active' | 'inactive' | 'probation' | 'suspended';
  privileges: string[];
  notes: string;
}

interface TrustedUserProgramProps {
  onInviteUser?: (email: string) => void;
  onUpdateUser?: (user: TrustedUser) => void;
  onRemoveUser?: (userId: string) => void;
}

const mockTrustedUsers: TrustedUser[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    role: 'Fund Manager',
    level: 3,
    contributionScore: 87,
    accuracyScore: 92,
    reportsSubmitted: 34,
    reportsAccepted: 29,
    lastActive: '2025-02-25T14:32:21Z',
    status: 'active',
    privileges: ['submit_reports', 'flag_content', 'review_peers'],
    notes: 'Consistently high quality reports'
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    role: 'Limited Partner',
    level: 2,
    contributionScore: 72,
    accuracyScore: 85,
    reportsSubmitted: 12,
    reportsAccepted: 9,
    lastActive: '2025-02-26T09:15:43Z',
    status: 'active',
    privileges: ['submit_reports', 'flag_content'],
    notes: ''
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    role: 'Capital Raiser',
    level: 1,
    contributionScore: 45,
    accuracyScore: 78,
    reportsSubmitted: 7,
    reportsAccepted: 4,
    lastActive: '2025-02-24T11:48:32Z',
    status: 'probation',
    privileges: ['submit_reports'],
    notes: 'On probation due to several false reports'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    role: 'Fund Manager',
    level: 4,
    contributionScore: 95,
    accuracyScore: 97,
    reportsSubmitted: 58,
    reportsAccepted: 55,
    lastActive: '2025-02-27T15:22:11Z',
    status: 'active',
    privileges: ['submit_reports', 'flag_content', 'review_peers', 'suggest_rules'],
    notes: 'Top contributor'
  },
  {
    id: '5',
    name: 'Eva Martinez',
    email: 'eva@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva',
    role: 'Limited Partner',
    level: 1,
    contributionScore: 32,
    accuracyScore: 67,
    reportsSubmitted: 3,
    reportsAccepted: 1,
    lastActive: '2025-02-20T08:33:14Z',
    status: 'inactive',
    privileges: ['submit_reports'],
    notes: 'Low activity in the past month'
  }
];

const getLevelName = (level: number): string => {
  switch (level) {
    case 1: return 'Contributor';
    case 2: return 'Trusted';
    case 3: return 'Verified';
    case 4: return 'Expert';
    default: return 'New';
  }
};

const getStatusBadge = (status: string): { variant: BadgeProps["variant"]; label: string } => {
  switch (status) {
    case 'active': return { variant: 'success', label: 'Active' };
    case 'inactive': return { variant: 'secondary', label: 'Inactive' };
    case 'probation': return { variant: 'warning', label: 'Probation' };
    case 'suspended': return { variant: 'destructive', label: 'Suspended' };
    default: return { variant: 'outline', label: status };
  }
};

export function TrustedUserProgram({ onInviteUser, onUpdateUser, onRemoveUser }: TrustedUserProgramProps) {
  const [users, setUsers] = useState<TrustedUser[]>(mockTrustedUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<TrustedUser | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const itemsPerPage = 5;

  // Filtered and paginated users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      const matchesLevel = selectedLevel === 'all' || user.level === parseInt(selectedLevel);
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [users, searchQuery, selectedStatus, selectedLevel]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleStatusChange = (userId: string, newStatus: TrustedUser['status']) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    );
    setUsers(updatedUsers);
    
    const updatedUser = updatedUsers.find(user => user.id === userId);
    if (updatedUser && onUpdateUser) {
      onUpdateUser(updatedUser);
    }
  };

  const handleLevelChange = (userId: string, newLevel: number) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, level: newLevel } : user
    );
    setUsers(updatedUsers);
    
    const updatedUser = updatedUsers.find(user => user.id === userId);
    if (updatedUser && onUpdateUser) {
      onUpdateUser(updatedUser);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    if (onRemoveUser) {
      onRemoveUser(userId);
    }
  };

  const handleInviteUser = () => {
    if (inviteEmail && onInviteUser) {
      onInviteUser(inviteEmail);
      setInviteEmail('');
    }
  };

  const openUserDetail = (user: TrustedUser) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Program Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Trusted User Program</h2>
              <p className="text-muted-foreground">Manage your trusted users who help moderate content.</p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Invite User</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Invite to Trusted User Program</AlertDialogTitle>
                  <AlertDialogDescription>
                    Invited users will be able to help moderate content based on their assigned level.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleInviteUser}>Send Invitation</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">1 - Contributor</SelectItem>
                <SelectItem value="2">2 - Trusted</SelectItem>
                <SelectItem value="3">3 - Verified</SelectItem>
                <SelectItem value="4">4 - Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Contribution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => {
                    const statusBadge = getStatusBadge(user.status);
                    return (
                      <TableRow key={user.id} className="cursor-pointer" onClick={() => openUserDetail(user)}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{getLevelName(user.level)}</div>
                            <div className="text-xs text-muted-foreground">Level {user.level}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex justify-between">
                              <span>Score: {user.contributionScore}</span>
                              <span>{user.reportsAccepted}/{user.reportsSubmitted} reports</span>
                            </div>
                            <Progress value={user.contributionScore} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant}>
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openUserDetail(user);
                              }}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No trusted users found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length > itemsPerPage && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Settings</CardTitle>
              <CardDescription>Configure how the trusted user program operates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Level Requirements</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Level 1 - Contributor</h4>
                      <p className="text-sm text-muted-foreground">Basic reporting privileges</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">0 points required</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Level 2 - Trusted</h4>
                      <p className="text-sm text-muted-foreground">Can flag content directly</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">50 points required</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Level 3 - Verified</h4>
                      <p className="text-sm text-muted-foreground">Can review other users' reports</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">100 points required</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Level 4 - Expert</h4>
                      <p className="text-sm text-muted-foreground">Can suggest moderation rules</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">200 points required</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Point System</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Accepted Report</h4>
                      <p className="text-sm text-muted-foreground">When a report leads to moderation action</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">+10 points</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Rejected Report</h4>
                      <p className="text-sm text-muted-foreground">When a report is deemed unnecessary</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">-2 points</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Peer Review</h4>
                      <p className="text-sm text-muted-foreground">Reviewing other users' reports</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">+5 points</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Rule Suggestion</h4>
                      <p className="text-sm text-muted-foreground">When a suggested rule is implemented</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">+20 points</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Program Options</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="public-recognition" defaultChecked />
                    <Label htmlFor="public-recognition">Enable public recognition badges</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto-promotion" defaultChecked />
                    <Label htmlFor="auto-promotion">Automatically promote users when eligible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notification" defaultChecked />
                    <Label htmlFor="notification">Send email notifications for level changes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="decay" />
                    <Label htmlFor="decay">Enable point decay for inactive users</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Analytics</CardTitle>
              <CardDescription>View metrics about your trusted user program's effectiveness.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Trusted Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Contribution Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(users.reduce((acc, user) => acc + user.contributionScore, 0) / users.length)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +5% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Report Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(users.reduce((acc, user) => acc + (user.reportsAccepted / (user.reportsSubmitted || 1)) * 100, 0) / users.length)}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +3% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Distribution by Level</h3>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(level => {
                    const usersAtLevel = users.filter(u => u.level === level).length;
                    const percentage = (usersAtLevel / users.length) * 100;
                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Level {level} - {getLevelName(level)}</span>
                          <span>{usersAtLevel} users ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* User Detail Dialog */}
      {selectedUser && (
        <AlertDialog open={showUserDetail} onOpenChange={setShowUserDetail}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">Trusted User Details</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="col-span-1">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback>{selectedUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="mr-1">{selectedUser.role}</Badge>
                      <Badge variant={getStatusBadge(selectedUser.status).variant}>
                        {getStatusBadge(selectedUser.status).label}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full pt-4 space-y-4">
                    <div>
                      <Label htmlFor="user-status">Status</Label>
                      <Select 
                        defaultValue={selectedUser.status}
                        onValueChange={(value) => handleStatusChange(selectedUser.id, value as TrustedUser['status'])}
                      >
                        <SelectTrigger id="user-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="probation">Probation</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="user-level">Trust Level</Label>
                      <Select 
                        defaultValue={selectedUser.level.toString()}
                        onValueChange={(value) => handleLevelChange(selectedUser.id, parseInt(value))}
                      >
                        <SelectTrigger id="user-level">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Contributor</SelectItem>
                          <SelectItem value="2">2 - Trusted</SelectItem>
                          <SelectItem value="3">3 - Verified</SelectItem>
                          <SelectItem value="4">4 - Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Contribution Score</Label>
                      <div className="flex justify-between">
                        <span className="text-sm">{selectedUser.contributionScore}/100</span>
                      </div>
                      <Progress value={selectedUser.contributionScore} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <Label>Accuracy Score</Label>
                      <div className="flex justify-between">
                        <span className="text-sm">{selectedUser.accuracyScore}/100</span>
                      </div>
                      <Progress value={selectedUser.accuracyScore} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Reporting Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="text-sm text-muted-foreground">Reports Submitted</div>
                      <div className="text-2xl font-bold">{selectedUser.reportsSubmitted}</div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="text-sm text-muted-foreground">Reports Accepted</div>
                      <div className="text-2xl font-bold">{selectedUser.reportsAccepted}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Assigned Privileges</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.privileges.map(privilege => (
                      <Badge key={privilege} variant="secondary">{privilege.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <textarea 
                    className="w-full h-24 p-2 border rounded-md" 
                    value={selectedUser.notes}
                    onChange={(e) => {
                      const updatedUser = { ...selectedUser, notes: e.target.value };
                      setSelectedUser(updatedUser);
                      
                      const updatedUsers = users.map(user =>
                        user.id === updatedUser.id ? updatedUser : user
                      );
                      setUsers(updatedUsers);
                      
                      if (onUpdateUser) {
                        onUpdateUser(updatedUser);
                      }
                    }}
                    placeholder="Add notes about this user..."
                  />
                </div>
              </div>
            </div>
            <AlertDialogFooter className="flex justify-between">
              <Button 
                variant="destructive" 
                onClick={() => {
                  handleRemoveUser(selectedUser.id);
                  setShowUserDetail(false);
                }}
              >
                Remove from Program
              </Button>
              <div className="space-x-2">
                <AlertDialogCancel>Close</AlertDialogCancel>
                <AlertDialogAction>Save Changes</AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
