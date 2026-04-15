import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';

/**
 * Generates an official Civix Grievance Report PDF and uploads it to Supabase Storage.
 * @param {Object} complaint - The complaint data object.
 * @param {string} userId - The ID of the authenticated user.
 * @returns {Promise<string>} - The public URL of the uploaded PDF.
 */
export const generateAndUploadReport = async (complaint, userId) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 30;

  // --- Header ---
  doc.setFillColor(33, 33, 33);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CIVIX', margin, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL GRIEVANCE PROTOCOL', margin, 32);
  
  const date = new Date().toLocaleDateString();
  doc.text(`DATE: ${date}`, 160, 25);
  doc.text(`CASE ID: ${complaint.id}`, 160, 32);

  y = 55;

  // --- Content Section ---
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(complaint.title, margin, y);
  y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, 190, y);
  y += 15;

  // Metadata Grid
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(complaint.status, margin + 40, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('PRIORITY:', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.text(complaint.priority, 110 + 40, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('DEPARTMENT:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(complaint.department, margin + 40, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('REGION:', margin, y);
  doc.setFont('helvetica', 'normal');
  const regionStr = `${complaint.region?.ward}, ${complaint.region?.city}`;
  doc.text(regionStr, margin + 40, y);
  y += 20;

  // Description
  doc.setFont('helvetica', 'bold');
  doc.text('GRIEVANCE SPECIFICATIONS:', margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  const splitDescription = doc.splitTextToSize(complaint.description || 'No description provided.', 170);
  doc.text(splitDescription, margin, y);
  y += (splitDescription.length * 6) + 10;

  // Impact
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATED IMPACT:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${complaint.impact || 0} Citizens Affected`, margin + 40, y);
  y += 20;

  // --- Footer ---
  y = 280;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This document is a machine-generated legal protocol. Verified via Supabase Regional Grid.', margin, y);
  doc.text('CONFIDENTIAL - AUTHORIZED ACCESS ONLY', margin, y + 5);

  // --- Finalize and Upload ---
  const pdfBlob = doc.output('blob');
  const fileName = `report-${complaint.id}.pdf`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('reports')
    .upload(filePath, pdfBlob, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('reports')
    .getPublicUrl(filePath);

  // Update complaint record with the report URL
  const { error: updateError } = await supabase
    .from('complaints')
    .update({ report_url: publicUrl })
    .eq('id', complaint.id);

  if (updateError) throw updateError;

  return publicUrl;
};
