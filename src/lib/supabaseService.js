/**
 * Geo Designs & Research — Supabase Database Service
 * Maps database columns for public.leads to frontend model and executes database operations.
 */

import { supabase } from './supabase';
import { normalizeConcernPerson } from '../data/mockLeads';

/**
 * Maps a database row from public.leads to the frontend lead object structure.
 * Verified database columns:
 * - id
 * - sr_no
 * - work_name
 * - scope_of_work
 * - client_name
 * - location
 * - concern_person
 * - contact_details
 * - designation
 * - source_of_inquiry
 * - duration_of_work
 * - hurdles_specific_task
 * - approximate_amount
 * - remarks
 * - created_at
 */
export function mapSupabaseToLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    srNo: Number(row.sr_no),
    tenderId: row.tender_id || '',
    nameOfWorkEmplement: row.work_name || '',
    scopeOfWork: row.scope_of_work || '',
    nameOfClient: row.client_name || '',
    location: row.location || '',
    clientContact: row.client_contact || '',
    clientConcernedPersonExternal: row.client_concerned_person_external || '',
    clientConcernPersonDesignationExternal: row.client_concern_person_designation_external || '',
    concernPerson: normalizeConcernPerson(row.concern_person) || '',
    contactDetails: row.contact_details || '',
    designationOfConcernPerson: row.designation || '',
    sourceOfInquiry: row.source_of_inquiry || '',
    referenceBy: row.reference_by || '',
    allottedTo: row.allotted_to || '',
    durationOfWork: row.duration_of_work || '',
    hurdlesSpecificTask: row.hurdles_specific_task || '',
    approximateAmount: row.approximate_amount || '',
    remarks: row.remarks || '',
    createdAt: row.created_at || null
  };
}

/**
 * Maps frontend lead form fields to the public.leads database columns.
 * Formats concern_person as expected by database constraints:
 * - leads_concern_person_check (requires 'Name - Designation')
 * - valid_concern_person_designation (requires matching designation)
 * Maps allottedTo, clientContact, and other new fields cleanly.
 */
export function mapLeadToSupabase(lead) {
  const allotted = (lead.allottedTo || '').trim();
  const person = (lead.concernPerson || allotted || 'Vishal Shah').trim();
  const designation = (
    lead.designationOfConcernPerson ||
    PERSON_DESIGNATION_MAP[allotted] ||
    PERSON_DESIGNATION_MAP[person] ||
    'COO'
  ).trim();

  // If person does not already include designation suffix, format as 'Name - Designation'
  const dbConcernPerson =
    person.includes(' - ')
      ? person
      : (designation ? `${person} - ${designation}` : person);

  const payload = {
    sr_no: Number(lead.srNo),
    work_name: (lead.nameOfWorkEmplement || '').trim(),
    scope_of_work: (lead.scopeOfWork || '').trim(),
    client_name: (lead.nameOfClient || '').trim(),
    location: (lead.location || '').trim(),
    concern_person: dbConcernPerson,
    contact_details: (lead.clientContact || lead.contactDetails || 'N/A').trim(),
    designation: designation,
    source_of_inquiry: lead.sourceOfInquiry || '',
    duration_of_work: (lead.durationOfWork || '').trim(),
    hurdles_specific_task: lead.hurdlesSpecificTask || '',
    approximate_amount: (lead.approximateAmount || '').trim(),
    remarks: (lead.remarks || '').trim()
  };

  // Add the 6 new fields if provided
  if (lead.tenderId !== undefined) payload.tender_id = (lead.tenderId || '').trim();
  if (lead.clientContact !== undefined) payload.client_contact = (lead.clientContact || '').trim();
  if (lead.clientConcernedPersonExternal !== undefined) {
    payload.client_concerned_person_external = (lead.clientConcernedPersonExternal || '').trim();
  }
  if (lead.clientConcernPersonDesignationExternal !== undefined) {
    payload.client_concern_person_designation_external = (lead.clientConcernPersonDesignationExternal || '').trim();
  }
  if (lead.referenceBy !== undefined) payload.reference_by = (lead.referenceBy || '').trim();
  if (lead.allottedTo !== undefined) payload.allotted_to = (lead.allottedTo || '').trim();

  return payload;
}

/**
 * Retrieves all lead records from public.leads ordered by sr_no ascending.
 */
export async function fetchLeadsFromSupabase() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('sr_no', { ascending: true });

  if (error) {
    return { success: false, error: error.message, data: [] };
  }

  const mappedLeads = (data || []).map(mapSupabaseToLead);
  return { success: true, data: mappedLeads };
}

/**
 * Inserts a single lead record into public.leads.
 */
export async function insertLeadToSupabase(lead) {
  const payload = mapLeadToSupabase(lead);

  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: mapSupabaseToLead(data) };
}

/**
 * Updates an existing lead record in public.leads.
 */
export async function updateLeadInSupabase(lead) {
  if (!lead || !lead.id) {
    return { success: false, error: 'Lead ID is required for update.' };
  }
  const payload = mapLeadToSupabase(lead);

  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', lead.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: mapSupabaseToLead(data) };
}

/**
 * Deletes a lead record from public.leads by ID.
 */
export async function deleteLeadFromSupabase(leadId) {
  if (!leadId) {
    return { success: false, error: 'Lead ID is required for deletion.' };
  }
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
