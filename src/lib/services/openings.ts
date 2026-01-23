import { createClient } from '@/lib/supabase/client'
import type { JobOpening, JobApplication } from '@/lib/types/database'

export async function getJobOpenings() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('job_openings')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as JobOpening[]
}

export async function createJobOpening(jobData: Omit<JobOpening, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('job_openings')
    .insert(jobData)
    .select()
    .single()
  
  if (error) throw error
  return data as JobOpening
}

export async function updateJobOpening(id: string, updates: Partial<JobOpening>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('job_openings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as JobOpening
}

export async function deleteJobOpening(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('job_openings')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getJobApplications() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job_openings (
        title,
        department
      )
    `)
    .order('applied_at', { ascending: false })
  
  if (error) throw error
  return data as (JobApplication & { job_openings: { title: string; department: string } })[]
}

export async function updateJobApplicationStatus(id: string, status: 'pending' | 'reviewing' | 'accepted' | 'rejected') {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('job_applications')
    .update({ 
      status,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as JobApplication
}
