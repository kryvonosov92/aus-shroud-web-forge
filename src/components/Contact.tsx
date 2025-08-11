import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Clock, Upload, X, Instagram } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    projectAddress: '',
    message: '',
    howHeardAboutUs: ''
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/', 'application/pdf', 'text/', '.dwg', '.dxf'];
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return false;
      }
      
      const isValidType = allowedTypes.some(type => 
        file.type.startsWith(type) || file.name.toLowerCase().endsWith(type)
      );
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const uploadedUrls: string[] = [];
    
    for (const file of attachments) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('quote-attachments')
        .upload(fileName, file);
        
      if (error) {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }
      
      uploadedUrls.push(data.path);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload files first
      const attachmentUrls = await uploadFiles();

      // Prepare attachments as base64 for emailing via Edge Function
      const readFileAsBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1] || '';
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const attachmentsPayload = await Promise.all(
        attachments.map(async (file) => ({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          base64: await readFileAsBase64(file),
        }))
      );

      // Insert quote request
      const { error } = await supabase
        .from('quote_requests')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          company_name: formData.companyName,
          project_address: formData.projectAddress,
          message: formData.message,
          how_heard_about_us: formData.howHeardAboutUs,
          attachment_urls: attachmentUrls,
        });

      if (error) {
        throw new Error(error.message);
      }

      // Fire email via Supabase Edge Function (non-blocking for UX)
      try {
        await supabase.functions.invoke('send-quote-email', {
          body: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            companyName: formData.companyName,
            projectAddress: formData.projectAddress,
            message: formData.message,
            howHeardAboutUs: formData.howHeardAboutUs,
            attachmentUrls,
            attachments: attachmentsPayload,
          },
        });
      } catch (emailErr) {
        console.warn('Email send failed:', emailErr);
      }

      toast({
        title: "Quote request submitted",
        description: "We'll get back to you within 24 hours!",
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        projectAddress: '',
        message: '',
        howHeardAboutUs: ''
      });
      setAttachments([]);

    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section id="contact" className="py-24 lg:py-32 bg-secondary/20">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-7xl mx-auto">
          <div>
            <Card className="border-border">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl lg:text-3xl mb-6">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div className="text-muted-foreground">(03) 9020 1422</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-muted-foreground">info@auswindowshrouds.com.au</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Instagram className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Instagram</div>
                    <div className="text-muted-foreground">@auswindowshrouds</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Address</div>
                    <div className="text-muted-foreground">1/10 Clarissa St, Campbellfield VIC 3061 (by appointment only)</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Service Areas</div>
                    <div className="text-muted-foreground">Australia-Wide</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Business Hours</div>
                    <div className="text-muted-foreground">Mon-Fri 8am-5.30pm</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl lg:text-3xl mb-6">Request a Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">First Name</label>
                      <Input 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name</label>
                      <Input 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name" 
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address" 
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number" 
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Company Name</label>
                    <Input 
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter your company name" 
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Project Address</label>
                    <Input 
                      name="projectAddress"
                      value={formData.projectAddress}
                      onChange={handleInputChange}
                      placeholder="Enter the project address" 
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Message *</label>
                    <Textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your window shroud requirements, number of windows, preferred style, etc." 
                      rows={4} 
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">How did you hear about us? *</label>
                    <Select
                      value={formData.howHeardAboutUs}
                      onValueChange={(value) => handleSelectChange('howHeardAboutUs', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="architect">Architect</SelectItem>
                        <SelectItem value="arc-agency">Arc Agency</SelectItem>
                        <SelectItem value="archipro">ArchiPro</SelectItem>
                        <SelectItem value="builder">Builder</SelectItem>
                        <SelectItem value="built-environment">Built Environment Channel</SelectItem>
                        <SelectItem value="building-design-qld">Building Design Queensland</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="mail-out">Mail Out</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="info-pack">Received Information Pack</SelectItem>
                        <SelectItem value="specifying-dynamics">Specifying Dynamics</SelectItem>
                        <SelectItem value="magazine">Magazine Publication</SelectItem>
                        <SelectItem value="the-block">The Block</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="local-project">The Local Project</SelectItem>
                        <SelectItem value="trade-show">Trade Show / Expo / Seminar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Attachments (Optional)</label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          accept="image/*,.pdf,.txt,.doc,.docx,.dwg,.dxf"
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload files or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Images, PDFs, plans, drawings (max 10MB each)
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Attached files:</p>
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-secondary/20 p-2 rounded">
                              <span className="text-sm truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Send Quote Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>;
};
export default Contact;