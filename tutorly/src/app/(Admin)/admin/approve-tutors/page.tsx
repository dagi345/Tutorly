"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function AdminTutorApprovalPage() {
  const tutors = useQuery(api.tutorProfiles.getUnapprovedTutors);
  const approve = useMutation(api.admin.approveTutor);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<null | any>(null);

  const filtered = useMemo(() => {
    if (!tutors) return [];
    const q = search.toLowerCase();
    return tutors.filter((t) =>
      t.user?.name?.toLowerCase().includes(q) ||
      t.subjects?.join(" ").toLowerCase().includes(q)
    );
  }, [tutors, search]);

  const handleApprove = (userId: Id<"users">) => approve({ userId });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Un-approved Tutors</h1>

        <Input
          placeholder="Search by name or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full md:w-1/3"
        />

        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tutor) => (
                <TableRow key={tutor._id}>
                  <TableCell>
                    <img
                      src={tutor.user?.avatarUrl || "/placeholder.png"}
                      alt={tutor.user?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{tutor.user?.name}</TableCell>
                  <TableCell>{tutor.user?.email}</TableCell>
                  <TableCell>
                    <Badge>{tutor.subjects?.join(", ")}</Badge>
                  </TableCell>
                  <TableCell>${tutor.hourlyRate / 100}</TableCell>
                  <TableCell className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(tutor.userId as Id<"users">)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTutor(tutor);
                        setModalOpen(true);
                      }}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Modal (unchanged) */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl w-[75vw] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedTutor?.user?.name} – Full Profile</DialogTitle>
            </DialogHeader>

            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                <div className="flex gap-4">
                  <img
                    src={selectedTutor?.user?.avatarUrl || "/placeholder.png"}
                    alt={selectedTutor?.user?.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <p><strong>Name:</strong> {selectedTutor?.user?.name}</p>
                    <p><strong>Email:</strong> {selectedTutor?.user?.email}</p>
                    <p><strong>Subjects:</strong> {selectedTutor?.subjects?.join(", ")}</p>
                    <p><strong>Hourly Rate:</strong> ${selectedTutor?.hourlyRate / 100}</p>
                    <p><strong>Rating:</strong> {selectedTutor?.rating}</p>
                    <p><strong>Bio:</strong> {selectedTutor?.bio}</p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    handleApprove(selectedTutor.userId as Id<"users">);
                    setModalOpen(false);
                  }}
                >
                  Approve Now
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}