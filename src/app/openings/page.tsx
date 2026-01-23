"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Eye, Loader2, Calendar, Mail, Phone, MapPin, FileText, ExternalLink, Search, Briefcase } from "lucide-react"
import { toast } from "sonner"
import {
  getJobOpenings,
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
  getJobApplications,
  updateJobApplicationStatus
} from "@/lib/services/openings"
import type { JobOpening, JobApplication } from "@/lib/types/database"

export default function OpeningsPage() {
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null)
  const [creatingJob, setCreatingJob] = useState(false)
  const [viewingApplication, setViewingApplication] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [appSearchQuery, setAppSearchQuery] = useState("")
  const [appStatusFilter, setAppStatusFilter] = useState("all")

  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    location: "",
    type: "full-time" as JobOpening['type'],
    description: "",
    requirements: "",
    responsibilities: "",
    salary_range: "",
    benefits: "",
    status: "active" as JobOpening['status'],
    application_deadline: ""
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [jobsData, appsData] = await Promise.all([
        getJobOpenings(),
        getJobApplications()
      ])
      setJobs(jobsData)
      setApplications(appsData)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setJobForm({
      title: "",
      department: "",
      location: "",
      type: "full-time",
      description: "",
      requirements: "",
      responsibilities: "",
      salary_range: "",
      benefits: "",
      status: "active",
      application_deadline: ""
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setCreatingJob(true)
  }

  const openEditDialog = (job: JobOpening) => {
    setJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements.join('\n'),
      responsibilities: job.responsibilities.join('\n'),
      salary_range: job.salary_range || "",
      benefits: job.benefits.join('\n'),
      status: job.status,
      application_deadline: job.application_deadline || ""
    })
    setEditingJob(job)
  }

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const jobData = {
      ...jobForm,
      requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
      responsibilities: jobForm.responsibilities.split('\n').filter(r => r.trim()),
      benefits: jobForm.benefits.split('\n').filter(b => b.trim()),
      salary_range: jobForm.salary_range || null,
      application_deadline: jobForm.application_deadline || null
    }

    try {
      if (editingJob) {
        await updateJobOpening(editingJob.id, jobData)
        toast.success('Job updated successfully')
      } else {
        await createJobOpening(jobData)
        toast.success('Job created successfully')
      }
      setEditingJob(null)
      setCreatingJob(false)
      loadData()
    } catch (error) {
      toast.error('Failed to save job')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job opening?')) return

    try {
      await deleteJobOpening(id)
      toast.success('Job deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete job')
    }
  }

  const handleUpdateApplicationStatus = async (id: string, status: JobApplication['status']) => {
    try {
      await updateJobApplicationStatus(id, status)
      toast.success('Application status updated')
      loadData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredApplications = applications.filter(app => {
    const matchesSearch = appSearchQuery === "" ||
      app.full_name.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      app.job_openings?.title.toLowerCase().includes(appSearchQuery.toLowerCase())
    
    const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-neutral-600" />
          <p className="text-sm text-neutral-600">Loading openings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Job Openings</h1>
              <p className="text-sm text-neutral-600">Manage job openings and applications</p>
            </div>
            <Button 
              onClick={openCreateDialog}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Job Opening
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="bg-white border border-border p-1">
            <TabsTrigger value="jobs" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Job Openings ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Applications ({applications.length})
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, department, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Briefcase className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                          <p className="text-sm text-muted-foreground">
                            {searchQuery || statusFilter !== "all" 
                              ? 'No jobs found matching your filters' 
                              : 'No job openings yet. Click "Create Job Opening" to add one.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job, index) => (
                        <motion.tr
                          key={job.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-neutral-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-neutral-900">{job.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{job.description}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-neutral-900 text-white hover:bg-neutral-800">
                              {job.department}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-700">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="capitalize">
                              {job.type.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant={job.status === 'active' ? 'default' : 'secondary'}
                              className={job.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                            >
                              {job.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-700">
                            {job.application_deadline ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(job.application_deadline).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEditDialog(job)}
                                className="hover:bg-neutral-100"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteJob(job.id)}
                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search applications by name, email, or job..."
                    value={appSearchQuery}
                    onChange={(e) => setAppSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 outline-none"
                  />
                </div>
                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Job Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Applied Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                          <p className="text-sm text-muted-foreground">
                            {appSearchQuery || appStatusFilter !== "all"
                              ? 'No applications found matching your filters'
                              : 'No applications yet.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app, index) => (
                        <motion.tr
                          key={app.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-neutral-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-neutral-900">{app.full_name}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Mail className="w-3 h-3" />
                                {app.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-neutral-900">{app.job_openings?.title}</p>
                              <p className="text-sm text-muted-foreground">{app.job_openings?.department}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-700">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {app.city}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-700">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(app.applied_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Select
                              value={app.status}
                              onValueChange={(value) => handleUpdateApplicationStatus(app.id, value as JobApplication['status'])}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="reviewing">Reviewing</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setViewingApplication(app)}
                              className="hover:bg-neutral-100"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Job Dialog */}
      <Dialog open={creatingJob || !!editingJob} onOpenChange={(open) => {
        if (!open) {
          setCreatingJob(false)
          setEditingJob(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job Opening' : 'Create Job Opening'}</DialogTitle>
            <DialogDescription>Fill out the job details below</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitJob} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Job Title *
                </label>
                <Input
                  id="title"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-foreground mb-2">
                  Department *
                </label>
                <Input
                  id="department"
                  required
                  value={jobForm.department}
                  onChange={(e) => setJobForm(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  Location *
                </label>
                <Input
                  id="location"
                  required
                  value={jobForm.location}
                  onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                  Type *
                </label>
                <Select
                  value={jobForm.type}
                  onValueChange={(value) => setJobForm(prev => ({ ...prev, type: value as JobOpening['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                  Status *
                </label>
                <Select
                  value={jobForm.status}
                  onValueChange={(value) => setJobForm(prev => ({ ...prev, status: value as JobOpening['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="salary_range" className="block text-sm font-medium text-foreground mb-2">
                  Salary Range
                </label>
                <Input
                  id="salary_range"
                  placeholder="e.g., $50k - $80k"
                  value={jobForm.salary_range}
                  onChange={(e) => setJobForm(prev => ({ ...prev, salary_range: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="application_deadline" className="block text-sm font-medium text-foreground mb-2">
                Application Deadline
              </label>
              <Input
                id="application_deadline"
                type="date"
                value={jobForm.application_deadline}
                onChange={(e) => setJobForm(prev => ({ ...prev, application_deadline: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <Textarea
                id="description"
                required
                rows={3}
                value={jobForm.description}
                onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-foreground mb-2">
                Requirements (one per line) *
              </label>
              <Textarea
                id="requirements"
                required
                rows={4}
                placeholder="Bachelor's degree in relevant field&#10;3+ years experience&#10;Strong communication skills"
                value={jobForm.requirements}
                onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-foreground mb-2">
                Responsibilities (one per line) *
              </label>
              <Textarea
                id="responsibilities"
                required
                rows={4}
                placeholder="Lead team meetings&#10;Develop project plans&#10;Collaborate with stakeholders"
                value={jobForm.responsibilities}
                onChange={(e) => setJobForm(prev => ({ ...prev, responsibilities: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="benefits" className="block text-sm font-medium text-foreground mb-2">
                Benefits (one per line)
              </label>
              <Textarea
                id="benefits"
                rows={3}
                placeholder="Health insurance&#10;401(k) matching&#10;Remote work options"
                value={jobForm.benefits}
                onChange={(e) => setJobForm(prev => ({ ...prev, benefits: e.target.value }))}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreatingJob(false)
                  setEditingJob(null)
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingJob ? 'Update Job' : 'Create Job'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Application Dialog */}
      <Dialog open={!!viewingApplication} onOpenChange={(open) => !open && setViewingApplication(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {viewingApplication?.job_openings?.title} - {viewingApplication?.job_openings?.department}
            </DialogDescription>
          </DialogHeader>

          {viewingApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium">{viewingApplication.full_name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {viewingApplication.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {viewingApplication.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">City</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {viewingApplication.city}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Qualifications</p>
                  <p className="font-medium">{viewingApplication.qualifications}</p>
                </div>
              </div>

              {(viewingApplication.resume_url || viewingApplication.portfolio_url || viewingApplication.website_url) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Links</p>
                  <div className="flex gap-2 flex-wrap">
                    {viewingApplication.resume_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={viewingApplication.resume_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-3 h-3 mr-1" />
                          Resume
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {viewingApplication.portfolio_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={viewingApplication.portfolio_url} target="_blank" rel="noopener noreferrer">
                          Portfolio
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {viewingApplication.website_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={viewingApplication.website_url} target="_blank" rel="noopener noreferrer">
                          Website
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">About</p>
                <p className="mt-1 whitespace-pre-wrap">{viewingApplication.short_about}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Why should we consider you?</p>
                <p className="mt-1 whitespace-pre-wrap">{viewingApplication.why_consider}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Most interesting thing about you</p>
                <p className="mt-1 whitespace-pre-wrap">{viewingApplication.most_interesting_thing}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Fun moment story</p>
                <p className="mt-1 whitespace-pre-wrap">{viewingApplication.fun_moment_story}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Applied on</p>
                  <p className="font-medium">{new Date(viewingApplication.applied_at).toLocaleString()}</p>
                </div>
                <div>
                  <label htmlFor="status-update" className="block text-sm font-medium text-foreground mb-2">
                    Update Status
                  </label>
                  <Select
                    value={viewingApplication.status}
                    onValueChange={(value) => {
                      handleUpdateApplicationStatus(viewingApplication.id, value as JobApplication['status'])
                      setViewingApplication({ ...viewingApplication, status: value })
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
