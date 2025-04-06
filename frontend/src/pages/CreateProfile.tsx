import { AuthWrapper, useLoggedInUser, auth } from "@/components/AuthWrapper";
import { ProfilePreview } from "@/components/ProfilePreview";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import brain from "brain";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Progress } from "@/components/ui/progress";

import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavigationBar } from "@/components/NavigationBar";
import * as z from "zod";

const socialLinksSchema = z.object({
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  website: z.string().url().optional(),
});

const teamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  experience: z.string(),
});

// Helper function for array fields
const arrayField = () => z.union([z.array(z.string()), z.string(), z.undefined()]).transform((val) => {
  if (Array.isArray(val)) return val;
  return val ? val.split(',').map((s) => s.trim()) : [];
}).optional();

const verificationDocumentSchema = z.object({
  document_type: z.string(),
  document_url: z.string().url(),
  status: z.string().default('pending'),
  uploaded_at: z.string(),
});

const profileFormSchema = z.object({
  // Common fields
  // Common fields
  verification_documents: z.array(verificationDocumentSchema).optional(),
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company name is required"),
  role: z.enum(["Fund Manager", "Limited Partner", "Capital Raiser"] as const),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  profile_image: z.string().optional(),
  social_links: socialLinksSchema.optional(),
  calendly_link: z.string().url().optional(),
  
  // Fund Manager fields
  geographic_focus: arrayField(),
  investment_stages: arrayField(),
  years_experience: z.number().positive().optional(),
  past_exits: z.number().nonnegative().optional(),
  team_size: z.number().positive().optional(),
  key_team_members: z.array(teamMemberSchema).optional(),
  regulatory_licenses: arrayField(),
  fundType: z.string().optional(),
  fundSize: z.number().positive().optional(),
  investmentFocus: arrayField(),
  historicalReturns: z.number().optional(),
  riskProfile: z.enum(["Conservative", "Moderate", "Aggressive"]).optional(),
  pitch_deck_url: z.string().url().optional(),
  data_room_url: z.string().url().optional(),
  fund_video_url: z.string().url().optional(),
  fund_description: z.string().optional(),
  minimum_investment: z.number().positive().optional(),
  investment_strategy: z.string().optional(),
  
  // Limited Partner fields
  preferred_sectors: arrayField(),
  geographic_preferences: arrayField(),
  investment_timeline: z.string().optional(),
  accreditation_status: z.enum(['Accredited', 'Qualified', 'Institutional', 'Other']).optional(),
  past_investments: arrayField(),
  investmentInterests: arrayField(),
  typicalCommitmentSize: z.number().positive().optional(),
  riskTolerance: z.enum(["Low", "Medium", "High"]).optional(),
  investmentHorizon: z.number().positive().optional(),
  
  // Capital Raiser fields
  success_rate: z.number().min(0).max(100).optional(),
  total_capital_raised: z.number().nonnegative().optional(),
  client_references: arrayField(),
  specialization_areas: arrayField(),
  geographic_coverage: arrayField(),
  dealsRaised: z.number().positive().optional(),
  industryFocus: arrayField(),
  typicalDealSize: z.number().positive().optional(),
  trackRecord: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

// ProfileFormData type is already defined by zod inference above

export default function CreateProfile() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuth, setShowAuth] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  // Type for attachment response
  type AttachmentResponse = {
    attachment_id: string;
    url: string;
    id: string;
    filename: string;
  };

  // Save form data to local storage
  const saveDraft = () => {
    const formData = form.getValues();
    localStorage.setItem('profile-draft', JSON.stringify(formData));
    setDraftSaved(true);
    toast({
      title: "Draft Saved",
      description: "Your profile draft has been saved.",
      variant: "default",
    });
  };

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useLoggedInUser();
  const navigate = useNavigate();
  const form = useForm<ProfileFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    shouldUnregister: false,
    defaultValues: {
      name: "",
      company: "",
      email: user?.email || "",
      phone: "",
    },
    resolver: zodResolver(profileFormSchema),
  });
  const { watch } = form;
  const selectedRole = watch("role");
  const isRole = (role: string | undefined, target: string): boolean => role === target;

  // Load draft data on mount
  useEffect(() => {
    const draft = localStorage.getItem('profile-draft');
    if (draft) {
      const draftData = JSON.parse(draft);
      Object.keys(draftData).forEach((key) => {
        form.setValue(key as keyof ProfileFormData, draftData[key]);
      });
      setDraftSaved(true);
    }
  }, [form]);

  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Fetch profile data if in edit mode
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isEditMode || !user) return;

      try {
        const response = await brain.get_profile({ userId: user.uid });
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const profileData = await response.json();
        
        // Set form values from profile data
        Object.keys(profileData).forEach((key) => {
          if (key in form.getValues()) {
            form.setValue(key as keyof ProfileFormData, profileData[key]);
          }
        });

        // Set social links if they exist
        if (profileData.social_links) {
          form.setValue('social_links', profileData.social_links);
        }

        // Set verification documents if they exist
        if (profileData.verification_documents) {
          form.setValue('verification_documents', profileData.verification_documents);
        }

        // Update preview URL if profile image exists
        if (profileData.profile_image) {
          setPreviewUrl(profileData.profile_image);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchProfileData();
  }, [isEditMode, user, form]);

  // First, wait for auth to be ready
  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged(() => {
      setIsAuthReady(true);
    });

    return () => unsubscribe?.();
  }, []);

  // Then, check profile only when auth is ready and we have a user
  useEffect(() => {
    let isMounted = true;

    const checkProfile = async () => {
      // Only proceed if auth is ready
      if (!isAuthReady) return;

      // If no user after auth is ready, redirect to home
      if (!user) {
        if (isMounted) {
          setIsCheckingProfile(false);
          navigate("/");
        }
        return;
      }

      try {
        const response = await brain.get_profile({ userId: user.uid });
        console.log('Profile creation response:', response);
      if (!response.ok) {
          throw new Error('Failed to check profile status');
        }
        const data = await response.json();
        
        if (isMounted) {
          if (data) {
            navigate("/dashboard");
          }
          setIsCheckingProfile(false);
        }
      } catch (error) {
      console.error('Profile creation error:', error);
        console.error("Error checking profile:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to check profile status. Please try again.",
            variant: "destructive",
          });
          setIsCheckingProfile(false);
        }
      }
    };

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, [user, navigate, toast, isAuthReady]);

  // Show loading state while checking auth and profile
  if (!isAuthReady || isCheckingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {!isAuthReady ? "Checking authentication..." : "Loading profile..."}
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show auth dialog
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar showAuth={() => setShowAuth(true)} />
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]">
          <AuthWrapper 
            title="Sign in to Create Your Profile" 
            google={true} 
            email={true}
            initialMode="signin"
          >
            <Button onClick={() => setShowAuth(false)} className="absolute top-4 right-4">
              Close
            </Button>
          </AuthWrapper>
        </div>
      </div>
    );
  }

  // Helper function to convert comma-separated string to array
  const stringToArray = (value: string | undefined | string[]): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.toString().split(',').map(item => item.trim());
  };

  const onSubmit = async (data: ProfileFormData) => {
    console.log('Starting form submission with data:', data);
    console.log('Starting form submission with data:', data);
    setIsSubmitting(true);

    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "You must be logged in to create a profile",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    console.log('Form submitted with data:', data);
    
    // Validate required fields for current step
    if (currentStep === 1) {
      if (!data.name || !data.company || !data.email || !data.role) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    if (!form || !user) {
      console.error('Form or user context not available');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert string arrays to proper arrays
      const arrayFields = {
        geographic_focus: stringToArray(data.geographic_focus),
        investment_stages: stringToArray(data.investment_stages),
        regulatory_licenses: stringToArray(data.regulatory_licenses),
        preferred_sectors: stringToArray(data.preferred_sectors),
        geographic_preferences: stringToArray(data.geographic_preferences),
        past_investments: stringToArray(data.past_investments),
        specialization_areas: stringToArray(data.specialization_areas),
        geographic_coverage: stringToArray(data.geographic_coverage),
        client_references: stringToArray(data.client_references),
        investmentFocus: stringToArray(data.investmentFocus),
        industryFocus: stringToArray(data.industryFocus),
        investmentInterests: stringToArray(data.investmentInterests),
      };

      // Common fields for all roles
      const commonFields = {
        user_id: user.uid,
        name: data.name,
        company: data.company,
        role: data.role,
        email: data.email,
        phone: data.phone,
        profile_image: data.profile_image,
        social_links: data.social_links,
        calendly_link: data.calendly_link,
      };

      // Role-specific fields
      const roleFields = data.role === 'Fund Manager' ? {
        geographic_focus: arrayFields.geographic_focus,
        investment_stages: arrayFields.investment_stages,
        years_experience: data.years_experience,
        past_exits: data.past_exits,
        team_size: data.team_size,
        regulatory_licenses: arrayFields.regulatory_licenses,
        fund_type: data.fundType,
        fund_size: data.fundSize,
        investment_focus: arrayFields.investmentFocus,
        historical_returns: data.historicalReturns,
        risk_profile: data.riskProfile,
        fund_description: data.fund_description,
        investment_strategy: data.investment_strategy,
        minimum_investment: data.minimum_investment,
        pitch_deck_url: data.pitch_deck_url,
        data_room_url: data.data_room_url,
        fund_video_url: data.fund_video_url,
      } : data.role === 'Limited Partner' ? {
        preferred_sectors: arrayFields.preferred_sectors,
        geographic_preferences: arrayFields.geographic_preferences,
        investment_timeline: data.investment_timeline,
        accreditation_status: data.accreditation_status,
        past_investments: arrayFields.past_investments,
        investment_interests: arrayFields.investmentInterests,
        typical_commitment_size: data.typicalCommitmentSize,
        risk_tolerance: data.riskTolerance,
        investment_horizon: data.investmentHorizon,
      } : {
        // Capital Raiser
        success_rate: data.success_rate,
        total_capital_raised: data.total_capital_raised,
        client_references: arrayFields.client_references,
        specialization_areas: arrayFields.specialization_areas,
        geographic_coverage: arrayFields.geographic_coverage,
        deals_raised: data.dealsRaised,
        industry_focus: arrayFields.industryFocus,
        typical_deal_size: data.typicalDealSize,
        track_record: data.trackRecord,
      };

      // Create profile
      console.log('Sending profile creation request with:', { ...commonFields, ...roleFields });
      const response = await brain.create_profile({
        profile: { ...commonFields, ...roleFields },
        token: {}
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create profile");
      }

      // Wait for profile to be created and indexed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify profile was created
      const profileResponse = await brain.get_profile({ userId: user.uid });
      if (!profileResponse.ok) {
        throw new Error("Profile creation succeeded but verification failed");
      }

      toast({
        title: "Profile Created",
        description: "Your profile has been created successfully.",
        variant: "default",
      });

      // Clear draft data from localStorage
      localStorage.removeItem('profile-draft');
      setDraftSaved(false);
      
      // Redirect to dashboard after profile creation
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress based on form completion
  const calculateProgress = () => {
    if (!selectedRole) return 0;
    
    const formValues = form.getValues();
    const requiredFields = ['name', 'company', 'email', 'role'];
    const roleSpecificFields = selectedRole === 'Fund Manager' 
      ? ['fundType', 'fundSize', 'investmentFocus', 'riskProfile']
      : selectedRole === 'Limited Partner'
      ? ['preferred_sectors', 'accreditation_status', 'investment_timeline']
      : ['success_rate', 'total_capital_raised', 'specialization_areas'];
    
    const allFields = [...requiredFields, ...roleSpecificFields];
    const completedFields = allFields.filter(field => {
      const value = formValues[field as keyof ProfileFormData];
      return value !== undefined && value !== "";
    }).length;
    
    return (completedFields / allFields.length) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      {showAuth && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]">
          <AuthWrapper title="Welcome to InvestMatch" google={true} email={true}>
            <Button onClick={() => setShowAuth(false)} className="absolute top-4 right-4">
              Close
            </Button>
          </AuthWrapper>
        </div>
      )}
      <NavigationBar showAuth={() => setShowAuth(true)} />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">{isEditMode ? 'Edit Your Profile' : 'Create Your Profile'}</h1>
            <p className="text-muted-foreground">
              Tell us about yourself to get started with InvestMatch
            </p>
          </div>
          <Button
            variant="outline"
            onClick={saveDraft}
            className="flex items-center gap-2"
          >
            {draftSaved ? "Draft Saved" : "Save Draft"}
          </Button>
        </div>

        <div className="flex justify-between mb-8 border rounded-lg p-4 bg-card">
          <div className={`flex-1 text-center ${currentStep === 1 ? 'text-primary' : ''}`}>
            <div className="text-lg font-medium">1. Basic Info</div>
            <div className="text-sm text-muted-foreground">Profile & Contact</div>
          </div>
          <div className={`flex-1 text-center ${currentStep === 2 ? 'text-primary' : ''}`}>
            <div className="text-lg font-medium">2. Role Details</div>
            <div className="text-sm text-muted-foreground">Role-specific Information</div>
          </div>
          <div className={`flex-1 text-center ${currentStep === 3 ? 'text-primary' : ''}`}>
            <div className="text-lg font-medium">3. Social & Contact</div>
            <div className="text-sm text-muted-foreground">Connect & Share</div>
          </div>
        </div>



        <div className="mb-6">
          <Progress value={calculateProgress()} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Profile completion: {Math.round(calculateProgress())}%
          </p>
        </div>

        <Card className="p-8 shadow-lg">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...form.register("name", { required: "Name is required" })}
                placeholder="John Doe"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                {...form.register("company", { required: "Company name is required" })}
                placeholder="Acme Inc"
              />
              {form.formState.errors.company && (
                <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder="you@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="role">Your Role</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select your primary role in the investment ecosystem:</p>
                      <ul className="list-disc list-inside mt-2">
                        <li>Fund Manager: You manage investment funds</li>
                        <li>Limited Partner: You invest in funds</li>
                        <li>Capital Raiser: You help raise capital</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                onValueChange={(value) => {
                  form.setValue("role", value as "Fund Manager" | "Limited Partner" | "Capital Raiser", { 
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
                value={form.watch("role") || ""}
                defaultValue=""
              >
                {form.formState.errors.role && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>
                )}
                <SelectTrigger>
                  <SelectValue placeholder="Select your role">{form.watch("role") || "Select your role"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fund Manager">Fund Manager</SelectItem>
                  <SelectItem value="Limited Partner">
                    Limited Partner
                  </SelectItem>
                  <SelectItem value="Capital Raiser">Capital Raiser</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isRole(selectedRole, "Fund Manager") && (
              <div className="space-y-6">
                <div className="space-y-4">
              <h3 className="text-lg font-medium">Verification Documents</h3>
              <div className="grid grid-cols-1 gap-4">
                {selectedRole === "Fund Manager" && (
                  <div className="space-y-2">
                    <Label htmlFor="fund_license">Fund License</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="fund_license"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploading(true);
                            try {
                              const response = await brain.upload_attachment({
                                file,
                                token: {},
                              });
                              if (!response.ok) throw new Error('Upload failed');
                              const data = await response.json() as AttachmentResponse;
                              
                              const documents = form.getValues('verification_documents') || [];
                              documents.push({
                                document_type: 'fund_license',
                                document_url: data.url,
                                status: 'pending',
                                uploaded_at: new Date().toISOString(),
                              });
                              form.setValue('verification_documents', documents);
                              
                              toast({
                                title: "Document Uploaded",
                                description: "Fund license has been uploaded successfully.",
                              });
                            } catch (error) {
                              console.error('Upload error:', error);
                              toast({
                                title: "Upload Failed",
                                description: "Failed to upload fund license. Please try again.",
                                variant: "destructive",
                              });
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload your fund management license or registration document (PDF, DOC, DOCX)
                    </p>
                  </div>
                )}

                {isRole(selectedRole, "Limited Partner") && (
                  <div className="space-y-2">
                    <Label htmlFor="accreditation">Accreditation Document</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="accreditation"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploading(true);
                            try {
                              const response = await brain.upload_attachment({
                                file,
                                token: {},
                              });
                              if (!response.ok) throw new Error('Upload failed');
                              const data = await response.json() as AttachmentResponse;
                              
                              const documents = form.getValues('verification_documents') || [];
                              documents.push({
                                document_type: 'accreditation',
                                document_url: data.url,
                                status: 'pending',
                                uploaded_at: new Date().toISOString(),
                              });
                              form.setValue('verification_documents', documents);
                              
                              toast({
                                title: "Document Uploaded",
                                description: "Accreditation document has been uploaded successfully.",
                              });
                            } catch (error) {
                              console.error('Upload error:', error);
                              toast({
                                title: "Upload Failed",
                                description: "Failed to upload accreditation document. Please try again.",
                                variant: "destructive",
                              });
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload your accreditation status document (PDF, DOC, DOCX)
                    </p>
                  </div>
                )}

                {/* Common for all roles */}
                <div className="space-y-2">
                  <Label htmlFor="identity">Identity Verification</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="identity"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Create preview URL
                          if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                          }
                          setPreviewUrl(URL.createObjectURL(file));
                          setIsUploading(true);
                          try {
                            const response = await brain.upload_attachment({
                              file,
                              token: {},
                            });
                            if (!response.ok) throw new Error('Upload failed');
                            const data = await response.json() as AttachmentResponse;
                            
                            const documents = form.getValues('verification_documents') || [];
                            documents.push({
                              document_type: 'identity',
                              document_url: data.url,
                              status: 'pending',
                              uploaded_at: new Date().toISOString(),
                            });
                            form.setValue('verification_documents', documents);
                            
                            toast({
                              title: "Document Uploaded",
                              description: "Identity document has been uploaded successfully.",
                            });
                          } catch (error) {
                            console.error('Upload error:', error);
                            toast({
                              title: "Upload Failed",
                              description: "Failed to upload identity document. Please try again.",
                              variant: "destructive",
                            });
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a government-issued ID or passport (PDF, DOC, DOCX, JPG, PNG)
                  </p>
                </div>

                {/* Display uploaded documents */}
                {form.watch('verification_documents')?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {form.watch('verification_documents')?.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div>
                            <p className="text-sm font-medium">
                              {doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1).replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Status: {doc.status}
                            </p>
                          </div>
                          <a
                            href={doc.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
                  <h3 className="text-lg font-medium">Fund Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="geographic_focus">Geographic Focus</Label>
                      <Input
                        id="geographic_focus"
                        {...form.register("geographic_focus")}
                        placeholder="e.g., North America, Europe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="investment_stages">Investment Stages</Label>
                      <Input
                        id="investment_stages"
                        {...form.register("investment_stages")}
                        placeholder="e.g., Seed, Series A"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="years_experience">Years of Experience</Label>
                      <Input
                        id="years_experience"
                        type="number"
                        {...form.register("years_experience", { valueAsNumber: true })}
                        placeholder="10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="past_exits">Past Exits</Label>
                      <Input
                        id="past_exits"
                        type="number"
                        {...form.register("past_exits", { valueAsNumber: true })}
                        placeholder="5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team_size">Team Size</Label>
                      <Input
                        id="team_size"
                        type="number"
                        {...form.register("team_size", { valueAsNumber: true })}
                        placeholder="15"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="regulatory_licenses">Regulatory Licenses</Label>
                      <Select
                        onValueChange={(value) => {
                          const currentLicenses = form.watch("regulatory_licenses") as string[] || [];
                          const licensesArray = Array.isArray(currentLicenses) ? currentLicenses : [];
                          
                          if (licensesArray.includes(value)) {
                            form.setValue("regulatory_licenses", licensesArray.filter(l => l !== value));
                          } else {
                            form.setValue("regulatory_licenses", [...licensesArray, value]);
                          }
                        }}
                        value={form.watch("regulatory_licenses")?.[0] || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select regulatory licenses (multiple)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SEC">SEC (Securities and Exchange Commission)</SelectItem>
                          <SelectItem value="FCA">FCA (Financial Conduct Authority)</SelectItem>
                          <SelectItem value="FINRA">FINRA (Financial Industry Regulatory Authority)</SelectItem>
                          <SelectItem value="MAS">MAS (Monetary Authority of Singapore)</SelectItem>
                          <SelectItem value="ASIC">ASIC (Australian Securities and Investments Commission)</SelectItem>
                          <SelectItem value="CSSF">CSSF (Commission de Surveillance du Secteur Financier)</SelectItem>
                          <SelectItem value="BaFin">BaFin (Federal Financial Supervisory Authority)</SelectItem>
                          <SelectItem value="DFSA">DFSA (Dubai Financial Services Authority)</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Display selected licenses */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {((form.watch("regulatory_licenses") || []) as string[]).map((license) => (
                          <Badge
                            key={license}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => {
                              const currentLicenses = form.watch("regulatory_licenses") as string[] || [];
                              const licensesArray = Array.isArray(currentLicenses) ? currentLicenses : [];
                              form.setValue("regulatory_licenses", licensesArray.filter(l => l !== license));
                            }}
                          >
                            {license}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                  <div className="flex items-center gap-2">
                      <Label htmlFor="fundType">Fund Type</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Choose the type of fund you manage:</p>
                            <ul className="list-disc list-inside mt-2">
                              <li>Venture Capital: Early-stage startups</li>
                              <li>Private Equity: Established companies</li>
                              <li>Hedge Fund: Public market strategies</li>
                              <li>Real Estate: Property investments</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  <Select
                    onValueChange={(value) => {
                      form.setValue("fundType", value, { 
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                      });
                    }}
                    value={form.watch("fundType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fund type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Venture Capital">Venture Capital</SelectItem>
                      <SelectItem value="Private Equity">Private Equity</SelectItem>
                      <SelectItem value="Hedge Fund">Hedge Fund</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Debt Fund">Debt Fund</SelectItem>
                      <SelectItem value="Fund of Funds">Fund of Funds</SelectItem>
                      <SelectItem value="Impact Fund">Impact Fund</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.fundType && (
                    <p className="text-sm text-destructive">{form.formState.errors.fundType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundSize">Fund Size (USD)</Label>
                  <Select
                    onValueChange={(value) => {
                      form.setValue("fundSize", parseInt(value), { 
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                      });
                    }}
                    value={form.watch("fundSize")?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fund size range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10000000">Under $10M</SelectItem>
                      <SelectItem value="25000000">$10M - $25M</SelectItem>
                      <SelectItem value="50000000">$25M - $50M</SelectItem>
                      <SelectItem value="100000000">$50M - $100M</SelectItem>
                      <SelectItem value="250000000">$100M - $250M</SelectItem>
                      <SelectItem value="500000000">$250M - $500M</SelectItem>
                      <SelectItem value="1000000000">$500M - $1B</SelectItem>
                      <SelectItem value="5000000000">Over $1B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                      <Label htmlFor="investmentFocus">Investment Focus</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Select the sectors you focus on investing in.</p>
                            <p className="mt-2">You can select multiple sectors to show your diverse investment interests.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  <Select
                    onValueChange={(value) => {
                      const currentFocus = form.watch("investmentFocus") as string[] || [];
                      const focusArray = Array.isArray(currentFocus) ? currentFocus : [];
                      
                      if (focusArray.includes(value)) {
                        form.setValue("investmentFocus", focusArray.filter(f => f !== value));
                      } else {
                        form.setValue("investmentFocus", [...focusArray, value]);
                      }
                    }}
                    value={form.watch("investmentFocus")?.[0] || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select investment focus areas (multiple)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology & Software</SelectItem>
                      <SelectItem value="Healthcare">Healthcare & Biotech</SelectItem>
                      <SelectItem value="FinTech">Financial Technology</SelectItem>
                      <SelectItem value="CleanTech">Clean Technology & Sustainability</SelectItem>
                      <SelectItem value="ConsumerTech">Consumer Technology</SelectItem>
                      <SelectItem value="Enterprise">Enterprise Software</SelectItem>
                      <SelectItem value="AI_ML">AI & Machine Learning</SelectItem>
                      <SelectItem value="Blockchain">Blockchain & Crypto</SelectItem>
                      <SelectItem value="ECommerce">E-Commerce & Retail</SelectItem>
                      <SelectItem value="SaaS">SaaS & Cloud Services</SelectItem>
                      <SelectItem value="DeepTech">Deep Technology</SelectItem>
                      <SelectItem value="IoT">Internet of Things</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Display selected focus areas */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {((form.watch("investmentFocus") || []) as string[]).map((focus) => (
                      <Badge
                        key={focus}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          const currentFocus = form.watch("investmentFocus") as string[] || [];
                          const focusArray = Array.isArray(currentFocus) ? currentFocus : [];
                          form.setValue("investmentFocus", focusArray.filter(f => f !== focus));
                        }}
                      >
                        {focus}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                      <Label htmlFor="riskProfile">Risk Profile</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Indicate your fund's risk tolerance level:</p>
                            <ul className="list-disc list-inside mt-2">
                              <li>Conservative: Lower risk, stable returns</li>
                              <li>Moderate: Balanced risk-return</li>
                              <li>Aggressive: Higher risk, potential for higher returns</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                      <Select
                        onValueChange={(value) => {
                          form.register("riskProfile").onChange({
                            target: { value, name: "riskProfile" },
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk profile" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conservative">Conservative</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fund_description">Fund Description</Label>
                  <Textarea
                    id="fund_description"
                    {...form.register("fund_description")}
                    placeholder="Describe your fund's mission and investment thesis"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investment_strategy">Investment Strategy</Label>
                  <Textarea
                    id="investment_strategy"
                    {...form.register("investment_strategy")}
                    placeholder="Describe your investment strategy and approach"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimum_investment">Minimum Investment (USD)</Label>
                  <Select
                    onValueChange={(value) => {
                      form.setValue("minimum_investment", parseInt(value), { 
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true
                      });
                    }}
                    value={form.watch("minimum_investment")?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select minimum investment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10000">Under $10K</SelectItem>
                      <SelectItem value="25000">$10K - $25K</SelectItem>
                      <SelectItem value="50000">$25K - $50K</SelectItem>
                      <SelectItem value="100000">$50K - $100K</SelectItem>
                      <SelectItem value="250000">$100K - $250K</SelectItem>
                      <SelectItem value="500000">$250K - $500K</SelectItem>
                      <SelectItem value="1000000">$500K - $1M</SelectItem>
                      <SelectItem value="5000000">Over $1M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Fund Materials</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pitch_deck_url">Pitch Deck URL</Label>
                      <Input
                        id="pitch_deck_url"
                        {...form.register("pitch_deck_url")}
                        placeholder="https://example.com/pitch-deck"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data_room_url">Data Room URL</Label>
                      <Input
                        id="data_room_url"
                        {...form.register("data_room_url")}
                        placeholder="https://example.com/data-room"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fund_video_url">Fund Video URL</Label>
                      <Input
                        id="fund_video_url"
                        {...form.register("fund_video_url")}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profile Image & Social</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="profile_image">Profile Image</Label>
                    <p className="text-sm text-muted-foreground">Supported formats: JPG, JPEG, PNG, GIF, WebP</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload a professional profile photo:</p>
                          <p className="mt-1">Supported formats: JPG, JPEG, PNG, GIF, WebP</p>
                          <ul className="list-disc list-inside mt-2">
                            <li>Use a clear, professional headshot</li>
                            <li>Good lighting and neutral background</li>
                            <li>Recent photo (within last 2 years)</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      id="profile_image"
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploading(true);
                          try {
                            const response = await brain.upload_profile_image({ file });
                            if (!response.ok) throw new Error('Upload failed');
                            const data = await response.json();
                            
                            // Set the profile image URL and content type
                            form.setValue('profile_image', {
                              url: data.url,
                              content_type: data.content_type
                            });
                            // Update preview URL
                            setPreviewUrl(data.url);
                            
                            toast({
                              title: "Image Uploaded",
                              description: "Profile image has been uploaded successfully.",
                            });
                          } catch (error) {
                            console.error('Upload error:', error);
                            toast({
                              title: "Upload Failed",
                              description: "Failed to upload profile image. Please try again.",
                              variant: "destructive",
                            });
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                    )}
                  </div>
                  {previewUrl && (
                    <div className="mt-2 flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-muted">
                        <img 
                          src={previewUrl} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {form.watch('profile_image') && (
                        <p className="text-sm text-muted-foreground">Profile image uploaded successfully</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calendly_link">Meeting Scheduler Link (Calendly)</Label>
                  <Input
                    id="calendly_link"
                    {...form.register("calendly_link")}
                    placeholder="https://calendly.com/your-link"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    {...form.register("social_links.linkedin")}
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter Profile</Label>
                  <Input
                    id="twitter"
                    {...form.register("social_links.twitter")}
                    placeholder="https://twitter.com/your-handle"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...form.register("social_links.website")}
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
            </div>

            {selectedRole === "Limited Partner" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_sectors">Preferred Sectors</Label>
                    <Select
                      onValueChange={(value) => {
                        const currentSectors = form.watch("preferred_sectors");
const sectorsArray = Array.isArray(currentSectors) ? currentSectors : [];
                        
                        
                        if (sectorsArray.includes(value)) {
                          form.setValue("preferred_sectors", sectorsArray.filter(s => s !== value));
                        } else {
                          form.setValue("preferred_sectors", [...sectorsArray, value]);
                        }
                      }}
                      value={form.watch("preferred_sectors")?.[0] || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred sectors (multiple)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Financial Services">Financial Services</SelectItem>
                        <SelectItem value="Consumer">Consumer</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Energy">Energy</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Display selected sectors */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {((form.watch("preferred_sectors") || []) as string[]).map((sector) => (
                        <Badge
                          key={sector}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            const currentSectors = form.watch("preferred_sectors") as string[] || [];
                            const sectorsArray = Array.isArray(currentSectors) ? currentSectors : [];
                            form.setValue("preferred_sectors", sectorsArray.filter(s => s !== sector));
                          }}
                        >
                          {sector}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="geographic_preferences">Geographic Preferences</Label>
                    <Select
                      onValueChange={(value) => {
                        const currentPrefs = form.watch("geographic_preferences");
const prefsArray = Array.isArray(currentPrefs) ? currentPrefs : [];
                        
                        
                        if (prefsArray.includes(value)) {
                          form.setValue("geographic_preferences", prefsArray.filter(p => p !== value));
                        } else {
                          form.setValue("geographic_preferences", [...prefsArray, value]);
                        }
                      }}
                      value={form.watch("geographic_preferences")?.[0] || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select geographic preferences (multiple)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North America">North America</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                        <SelectItem value="Latin America">Latin America</SelectItem>
                        <SelectItem value="Middle East">Middle East</SelectItem>
                        <SelectItem value="Africa">Africa</SelectItem>
                        <SelectItem value="Global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Display selected geographic preferences */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {((form.watch("geographic_preferences") || []) as string[]).map((pref) => (
                        <Badge
                          key={pref}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            const currentPrefs = form.watch("geographic_preferences") as string[] || [];
                            const prefsArray = Array.isArray(currentPrefs) ? currentPrefs : [];
                            form.setValue("geographic_preferences", prefsArray.filter(p => p !== pref));
                          }}
                        >
                          {pref}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investment_timeline">Investment Timeline</Label>
                    <Select
                      onValueChange={(value) => {
                        form.setValue("investment_timeline", value, { 
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true
                        });
                      }}
                      value={form.watch("investment_timeline")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select investment timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3 years">1-3 years</SelectItem>
                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                        <SelectItem value="5-7 years">5-7 years</SelectItem>
                        <SelectItem value="7-10 years">7-10 years</SelectItem>
                        <SelectItem value="10+ years">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="accreditation_status">Accreditation Status</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Your investor accreditation level:</p>
                            <ul className="list-disc list-inside mt-2">
                              <li>Accredited: Meet SEC requirements</li>
                              <li>Qualified: Higher investment thresholds</li>
                              <li>Institutional: Organizations & funds</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      onValueChange={(value) => {
                        form.register("accreditation_status").onChange({
                          target: { value, name: "accreditation_status" },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Accredited">Accredited</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Institutional">Institutional</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="past_investments">Past Investments</Label>
                    <Textarea
                      id="past_investments"
                      {...form.register("past_investments")}
                      placeholder="List your notable past investments"
                    />
                  </div>
                </div>
              </div>
            )}

            {isRole(selectedRole, "Capital Raiser") && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="success_rate">Success Rate (%)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Your historical success rate in capital raising:</p>
                            <ul className="list-disc list-inside mt-2">
                              <li>Calculate: (Successful Raises / Total Attempts) × 100</li>
                              <li>Include only completed fundraising campaigns</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="success_rate"
                      type="number"
                      {...form.register("success_rate", { valueAsNumber: true })}
                      placeholder="85"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_capital_raised">Total Capital Raised (USD)</Label>
                    <Input
                      id="total_capital_raised"
                      type="number"
                      {...form.register("total_capital_raised", { valueAsNumber: true })}
                      placeholder="100000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization_areas">Specialization Areas</Label>
                    <Input
                      id="specialization_areas"
                      {...form.register("specialization_areas")}
                      placeholder="e.g., Growth Capital, M&A"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="geographic_coverage">Geographic Coverage</Label>
                    <Input
                      id="geographic_coverage"
                      {...form.register("geographic_coverage")}
                      placeholder="e.g., Global, APAC"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_references">Client References</Label>
                    <Textarea
                      id="client_references"
                      {...form.register("client_references")}
                      placeholder="List some notable client references"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button">
                      Preview Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <ProfilePreview data={form.getValues()} />
                  </DialogContent>
                </Dialog>
              </div>
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
                    const currentData = form.getValues();
                    // Validate current step before proceeding
                    if (currentStep === 1 && (!currentData.name || !currentData.company || !currentData.email || !currentData.role)) {
                      toast({
                        title: "Error",
                        description: "Please fill in all required fields",
                        variant: "destructive",
                      });
                      return;
                    }
                    setCurrentStep(prev => Math.min(3, prev + 1));
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (isEditMode ? "Saving Profile..." : "Creating Profile...") : (isEditMode ? "Save Profile" : "Create Profile")}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
      <Toaster />
      </div>
    </div>
  );
}
