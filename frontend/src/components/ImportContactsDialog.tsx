import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import brain from "brain";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import * as React from "react";

// Define the schema for a single contact
const contactSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  phone: z.string().optional(),
  notes: z.string().optional(),
  // Additional matching fields
  fund_type: z.string().optional(),
  investment_focus: z.array(z.string()).optional(),
  fund_size: z.number().positive("Fund size must be positive").optional(),
  investment_horizon: z.number().int().positive("Investment horizon must be positive").optional(),
  risk_profile: z.string().optional(),
  sectors: z.array(z.string()).optional(),
  years_experience: z.number().int().positive("Years of experience must be positive").optional(),
});


import { Contact } from "types";

type ContactInput = z.infer<typeof contactSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export function ImportContactsDialog({
  isOpen,
  onClose,
  onImportSuccess,
}: Props) {
  const [activeTab, setActiveTab] = React.useState<string>("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [columnMapping, setColumnMapping] = React.useState<Record<string, string>>({});
  const [rawData, setRawData] = React.useState<string[][]>([]);
  const [mappingComplete, setMappingComplete] = React.useState(false);

  const requiredFields = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "company", label: "Company" },
    { key: "role", label: "Role" },
  ];

  const matchingFields = [
    { key: "fund_type", label: "Fund Type", options: ["Venture Capital", "Private Equity", "Hedge Fund", "Angel", "Family Office"] },
    { key: "investment_focus", label: "Investment Focus", isArray: true },
    { key: "fund_size", label: "Fund Size", isNumber: true },
    { key: "investment_horizon", label: "Investment Horizon", isNumber: true },
    { key: "risk_profile", label: "Risk Profile", options: ["Conservative", "Moderate", "Aggressive"] },
    { key: "sectors", label: "Sectors", isArray: true },
    { key: "years_experience", label: "Years Experience", isNumber: true },
  ];

  const optionalFields = [
    { key: "phone", label: "Phone" },
    { key: "notes", label: "Notes" },
    ...matchingFields,
  ];

  // Common variations of field names for auto-matching
  const fieldVariations: Record<string, string[]> = {
    // Basic fields
    name: ["name", "full name", "contact name", "first name", "firstname"],
    email: ["email", "email address", "e-mail", "mail"],
    company: ["company", "organization", "organisation", "business", "employer"],
    role: ["role", "title", "position", "job title", "designation"],
    phone: ["phone", "telephone", "contact number", "mobile", "cell"],
    notes: ["notes", "comments", "description", "additional info"],
    // Matching fields
    fund_type: ["fund type", "fund category", "investment vehicle"],
    investment_focus: ["investment focus", "investment strategy", "focus areas"],
    fund_size: ["fund size", "aum", "assets under management"],
    investment_horizon: ["investment horizon", "time horizon", "investment period"],
    risk_profile: ["risk profile", "risk tolerance", "risk appetite"],
    sectors: ["sectors", "industries", "sector focus"],
    years_experience: ["years experience", "experience", "years in industry"],
  };

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      id: `contact-${Date.now()}`,
      name: "",
      email: "",
      company: "",
      role: "",
      phone: "",
      notes: "",
      fund_type: "",
      investment_focus: [],
      fund_size: undefined,
      investment_horizon: undefined,
      risk_profile: "",
      sectors: [],
      years_experience: undefined,
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");

    try {
      const text = await selectedFile.text();
      const rows = text.split("\n").filter(row => row.trim());
      const csvHeaders = rows[0].split(",").map(h => h.trim().toLowerCase());
      setHeaders(csvHeaders);
      setRawData(rows.slice(1).map(row => row.split(",").map(cell => cell.trim())));
      
      // Auto-match columns
      const initialMapping: Record<string, string> = {};
      [...requiredFields, ...optionalFields].forEach(({ key }) => {
        const variations = fieldVariations[key];
        const matchedHeader = csvHeaders.find(header =>
          variations.includes(header.toLowerCase())
        );
        if (matchedHeader) {
          initialMapping[key] = matchedHeader;
        }
      });
      setColumnMapping(initialMapping);
      setMappingComplete(false);
      setContacts([]);

      // Parsing moved to processMapping function

    
    } catch (err) {
      setError("Failed to parse CSV file. Please check the format.");
      console.error("Error parsing CSV:", err);
    }
  };

  const isValidMapping = () => {
    return requiredFields.every(({ key }) => columnMapping[key]);
  };

  const processMapping = () => {
    if (!isValidMapping()) return;

    const parsedContacts: Contact[] = [];
    let skippedRows = 0;

    rawData.forEach((row, index) => {
      if (row.length === 0 || row.every(cell => !cell.trim())) {
        // Skip empty rows
        return;
      }

      try {
        const headerToIndex = headers.reduce((acc, header, i) => {
          acc[header] = i;
          return acc;
        }, {} as Record<string, number>);

        // Get values from mapped columns
        const name = row[headerToIndex[columnMapping.name]]?.trim();
        const email = row[headerToIndex[columnMapping.email]]?.trim();
        const company = row[headerToIndex[columnMapping.company]]?.trim();
        const role = row[headerToIndex[columnMapping.role]]?.trim();
        const phone = columnMapping.phone ? row[headerToIndex[columnMapping.phone]]?.trim() : "";
        const notes = columnMapping.notes ? row[headerToIndex[columnMapping.notes]]?.trim() : "";

        // Skip row if any required field is missing
        if (!name || !email || !company || !role) {
          throw new Error("Missing required fields");
        }

        // Get values for matching fields
        const fund_type = columnMapping.fund_type ? row[headerToIndex[columnMapping.fund_type]]?.trim() : undefined;
        const investment_focus = columnMapping.investment_focus ? row[headerToIndex[columnMapping.investment_focus]]?.trim()?.split(",").map(s => s.trim()) : undefined;
        const fund_size = columnMapping.fund_size ? Number(row[headerToIndex[columnMapping.fund_size]]) : undefined;
        const investment_horizon = columnMapping.investment_horizon ? Number(row[headerToIndex[columnMapping.investment_horizon]]) : undefined;
        const risk_profile = columnMapping.risk_profile ? row[headerToIndex[columnMapping.risk_profile]]?.trim() : undefined;
        const sectors = columnMapping.sectors ? row[headerToIndex[columnMapping.sectors]]?.trim()?.split(",").map(s => s.trim()) : undefined;
        const years_experience = columnMapping.years_experience ? Number(row[headerToIndex[columnMapping.years_experience]]) : undefined;

        // Skip if any required field is missing or invalid
        if (!name || !email || !company || !role) {
          throw new Error("Missing required fields");
        }

        // Create contact with all fields and validate with schema
        const contact: Contact = {
          name,
          email,
          company,
          role,
          phone: phone || undefined,
          notes: notes || undefined,
          fund_type: fund_type || undefined,
          investment_focus: investment_focus || undefined,
          fund_size: !isNaN(fund_size as number) ? fund_size : undefined,
          investment_horizon: !isNaN(investment_horizon as number) ? investment_horizon : undefined,
          risk_profile: risk_profile || undefined,
          sectors: sectors || undefined,
          years_experience: !isNaN(years_experience as number) ? years_experience : undefined,
        };
        parsedContacts.push(contact);
      } catch (err) {
        console.warn(`Invalid contact at row ${index + 1}:`, err);
        skippedRows++;
      }
    });

    if (parsedContacts.length > 0) {
      setContacts(parsedContacts);
      setMappingComplete(true);
      if (skippedRows > 0) {
        setError(`Mapped ${parsedContacts.length} contacts. Skipped ${skippedRows} invalid rows.`);
      }
    } else {
      setError("No valid contacts found after mapping. Please check the column mapping and try again.");
    }
  };

  const handleImport = async () => {
    if (!contacts.length) {
      setError("No valid contacts found in the file.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await brain.import_contacts({
        contacts,
        token: {}, // Token will be added by AuthWrapper
      });

      if (response.ok) {
        onImportSuccess();
        onClose();
      } else {
        setError("Failed to import contacts");
      }
    } catch (err) {
      setError("An error occurred while importing contacts");
      console.error("Error importing contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (data: Contact) => {
    setLoading(true);
    setError("");

    try {
      const response = await brain.import_contacts({
        contacts: [data],
        token: {},
      });

      if (response.ok) {
        onImportSuccess();
        onClose();
      } else {
        setError("Failed to add contact");
      }
    } catch (err) {
      setError("An error occurred while adding the contact");
      console.error("Error adding contact:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = "Name,Email,Company,Role,Phone,Notes,Fund Type,Investment Focus,Fund Size,Investment Horizon,Risk Profile,Sectors,Years Experience\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your contacts or add them manually.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="text-xs"
              >
                Download Template
              </Button>
              {file && !mappingComplete && (
                <Button
                  size="sm"
                  onClick={processMapping}
                  disabled={!isValidMapping()}
                >
                  Process Mapping
                </Button>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contacts-file">Contacts CSV File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="contacts-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {file && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFile(null);
                      setContacts([]);
                      setError("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {file && !mappingComplete && headers.length > 0 && (
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-sm font-medium">Map Columns</h3>
                <div className="grid gap-4">
                  {requiredFields.map(({ key, label }) => (
                    <div key={key} className="grid grid-cols-2 gap-2 items-center">
                      <Label className="text-right">{label}*</Label>
                      <Select
                        value={columnMapping[key] || ""}
                        onValueChange={(value) => {
                          setColumnMapping(prev => ({ ...prev, [key]: value }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {optionalFields.map(({ key, label }) => (
                    <div key={key} className="grid grid-cols-2 gap-2 items-center">
                      <Label className="text-right">{label}</Label>
                      <Select
                        value={columnMapping[key] || ""}
                        onValueChange={(value) => {
                          setColumnMapping(prev => ({ ...prev, [key]: value }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contacts.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Preview ({contacts.length} contacts)</div>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {contacts.map((contact) => (
                      <Card key={`${contact.name}-${contact.email}`} className="p-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {contact.name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {contact.email}
                          </div>
                          <div>
                            <span className="font-medium">Company:</span> {contact.company}
                          </div>
                          <div>
                            <span className="font-medium">Role:</span> {contact.role}
                          </div>
                          {contact.phone && (
                            <div>
                              <span className="font-medium">Phone:</span> {contact.phone}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {error && <div className="text-sm text-destructive">{error}</div>}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!contacts.length || loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                    Importing...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Contacts
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleManualAdd)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fund_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fund Type (Optional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fund type" />
                          </SelectTrigger>
                          <SelectContent>
                            {matchingFields.find(f => f.key === "fund_type")?.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investment_focus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Focus (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()))}
                          placeholder="Enter comma-separated focus areas"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fund_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fund Size (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investment_horizon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Horizon (Years, Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="risk_profile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Profile (Optional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk profile" />
                          </SelectTrigger>
                          <SelectContent>
                            {matchingFields.find(f => f.key === "risk_profile")?.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sectors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sectors (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()))}
                          placeholder="Enter comma-separated sectors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="years_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years Experience (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && <div className="text-sm text-destructive">{error}</div>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
                      Adding Contact...
                    </div>
                  ) : (
                    "Add Contact"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

