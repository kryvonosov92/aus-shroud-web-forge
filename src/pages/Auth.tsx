import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin");
      }
    };
    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/admin");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signInWithLinkedIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/admin`
        }
      });

      if (error) {
        console.error('LinkedIn auth error:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to sign in with LinkedIn",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Sign In - AusWindowShrouds"
        description="Sign in to your AusWindowShrouds account using LinkedIn to access exclusive features and manage your profile."
        canonicalPath="/auth"
        noindex={true}
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your AusWindowShrouds account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={signInWithLinkedIn}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <Linkedin className="mr-2 h-5 w-5" />
              {loading ? "Connecting..." : "Continue with LinkedIn"}
            </Button>
            
            <p className="text-sm text-muted-foreground text-center">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;