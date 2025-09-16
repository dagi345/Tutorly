"use client";

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import AvailabilityPicker from "@/components/AvailabilityPicker";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().url("Invalid URL").optional(),
  subjects: z.string().min(1, "At least one subject is required"),
  hourlyRate: z.coerce.number().min(1, "Hourly rate must be a positive number"),
  bio: z.string().min(20, "Bio should be at least 20 characters"),
  availability: z.array(z.string()).optional(),
});

export default function TutorProfilePage() {
  const { user } = useUser();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      avatarUrl: "",
      subjects: "",
      hourlyRate: 0,
      bio: "",
      availability: [],
    },
  });

  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id ?? "skip" });
  const tutorProfile = useQuery(
    api.tutorProfiles.getTutorByUserId,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const updateUser = useMutation(api.users.updateUserProfile);
  const updateTutor = useMutation(api.tutorProfiles.updateTutorProfile);

  const resetForm = useCallback(() => {
    if (convexUser) {
        form.reset({
            name: convexUser.name ?? "",
            email: convexUser.email ?? "",
            avatarUrl: convexUser.avatarUrl ?? "",
            subjects: tutorProfile?.subjects?.join(", ") ?? "",
            hourlyRate: tutorProfile?.hourlyRate ?? 0,
            bio: tutorProfile?.bio ?? "",
            availability: tutorProfile?.availability ?? [],
        });
    }
  }, [convexUser, tutorProfile, form.reset]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!convexUser) return;

    try {
         await updateUser({
    userId: convexUser._id,
    name: values.name,
    email: values.email,
    avatarUrl: values.avatarUrl,
  });

  // Update tutor profile
  await updateTutor({
    userId: convexUser._id,
    updates: {
      subjects: values.subjects.split(",").map((s) => s.trim()),
      hourlyRate: values.hourlyRate,
      bio: values.bio,
      availability: values.availability, // <-- direct array of ISO strings
    },
  });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (!convexUser || !tutorProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="bg-gray-100 border-b">
            <CardTitle className="text-2xl font-bold">Edit Your Tutor Profile</CardTitle>
            <CardDescription>Keep your information up-to-date for students.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g., Jane Doe" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input {...field} type="email" placeholder="e.g., jane.doe@example.com" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="avatarUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl><Input {...field} placeholder="https://example.com/avatar.png" /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="subjects"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teaching Subjects</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g., Math, Science, English" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (in ETB)</FormLabel>
                          <FormControl><Input {...field} type="number" placeholder="e.g., 500" value={Number(field.value) || 0} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Biography</FormLabel>
                        <FormControl><Textarea {...field} rows={5} placeholder="Tell students a little about yourself, your teaching style, and your experience." /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
              <FormField
  control={form.control}
  name="availability"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Weekly Availability</FormLabel>
      <FormControl>


        <AvailabilityPicker
          value={field.value}
          onChange={field.onChange}
        />

        
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

                <Button type="submit" className="w-full text-lg py-3 mt-4">
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
