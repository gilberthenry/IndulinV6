import React, { useEffect, useState, useRef } from 'react';
import { X, User, Download } from 'lucide-react';
import hrService from '../../services/hrService';
import kcpLogo from '../../assets/kings-college-of-the-philippines-logo.jpg';
import html2pdf from 'html2pdf.js';

const API_BASE_URL = 'http://localhost:5000';

const FormField = ({ label, value, className = "", highlight = false }) => (
  <div className={`py-2 ${className}`}>
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
    <p className={`text-sm font-medium border-b pb-1.5 ${
      !value || value === '—' 
        ? 'text-gray-400 italic border-gray-200' 
        : 'text-gray-900 border-gray-300'
    }`}>
      {value || '—'}
    </p>
  </div>
);

const SectionTitle = ({ children, number }) => (
  <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-3 border-l-4 border-purple-600">
    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
      {number && <span className="text-purple-600 mr-2">{number}.</span>}
      {children}
    </h3>
  </div>
);

export default function EmployeeProfileModal({ employeeId, isOpen, onClose }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const pdfRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!employeeId) return setEmployee(null);
      setLoading(true);
      try {
        const data = await hrService.getEmployeeById(employeeId);
        if (mounted) setEmployee(data);
      } catch (err) {
        if (mounted) setEmployee(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [employeeId]);

  const handleDownloadPDF = async () => {
    if (!employee || !pdfRef.current) return;
    
    setExporting(true);
    
    try {
      // Generate filename
      const fullName = employee.fullName || `${employee.firstName || ''} ${employee.surname || ''}`.trim() || 'Employee';
      const filename = `PDS_${fullName.replace(/\s+/g, '_')}.pdf`;

      // PDF options
      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate PDF
      await html2pdf().set(options).from(pdfRef.current).save();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Print & PDF Styles */}
      <style>{`
        /* Hide employee photo from PDF/Print */
        .employee-photo-screen {
          display: none !important;
        }
        
        @media print {
          /* Hide all non-printable elements */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          .employee-photo-screen {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Hide everything by default */
          body * {
            visibility: hidden !important;
          }
          
          /* Make print area and its children visible */
          #pds-printable,
          #pds-printable * {
            visibility: visible !important;
          }
          
          /* Show print footer */
          .print-footer {
            display: block !important;
            visibility: visible !important;
          }
          
          /* Position print area at top of page */
          #pds-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            max-height: none !important;
            overflow: visible !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          
          /* Page settings */
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          /* Remove shadows and borders for clean print */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          
          /* Page break control */
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .print-break {
            page-break-after: always !important;
          }
          
          /* Ensure images print correctly */
          img {
            max-width: 100% !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        /* PDF Export Specific Styles */
        #pds-printable {
          background: white;
          width: 100%;
        }
        
        /* Avoid page breaks inside important elements */
        .avoid-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 no-print">
        {/* Modal */}
        <div className="relative bg-white w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors no-print"
          >
            <X size={20} className="text-gray-600" />
          </button>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          </div>
        ) : employee ? (
          <>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* PDF Export Container */}
              <div ref={pdfRef} id="pds-printable">
              {/* Header - Centered Layout for PDF/Print */}
              <div className="bg-white px-8 py-6 border-b-2 border-gray-300">
                {/* Centered Header Content */}
                <div className="text-center">
                  {/* School Logo */}
                  <div className="flex justify-center mb-4">
                    <img 
                      src={kcpLogo} 
                      alt="King's College of the Philippines" 
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  
                  {/* School Name and Address */}
                  <h1 className="text-xl font-bold text-gray-800 leading-tight mb-1">
                    King's College of the Philippines
                  </h1>
                  <p className="text-sm text-gray-600 mb-6">La Trinidad, Benguet</p>
                  
                  {/* Form Title - Simple */}
                  <div className="border-t-2 border-gray-300 py-4">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider">
                      Personal Data Sheet
                    </h2>
                  </div>
                </div>
              </div>

              {/* I. PERSONAL INFORMATION */}
              <div className="avoid-break">
                <SectionTitle number="I">Personal Information</SectionTitle>
                <div className="px-8 py-6 bg-white">
                  {/* Name Fields */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3 pb-1 border-b-2 border-purple-200">Full Name</h4>
                    <div className="grid grid-cols-3 gap-6">
                      <FormField label="Surname" value={employee.surname} />
                      <FormField label="First Name" value={employee.firstName} />
                      <FormField label="Middle Name" value={employee.middleName} />
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3 pb-1 border-b-2 border-purple-200">Personal Details</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <FormField label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} />
                      <FormField label="Place of Birth" value={employee.placeOfBirth} />
                      <FormField label="Sex" value={employee.sex} />
                      <FormField label="Civil Status" value={employee.civilStatus} />
                      <FormField label="Citizenship" value={employee.citizenship} />
                      <FormField label="Religion" value={employee.religion} />
                      <FormField label="Blood Type" value={employee.bloodType} />
                      <FormField label="Height / Weight" value={employee.height && employee.weight ? `${employee.height} / ${employee.weight}` : '—'} />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3 pb-1 border-b-2 border-purple-200">Contact Details</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="Email Address" value={employee.email} />
                      <FormField label="Mobile Number" value={employee.contactNumber} />
                    </div>
                  </div>

                  {/* Government IDs */}
                  <div>
                    <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3 pb-1 border-b-2 border-purple-200">Identification Numbers</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <FormField label="Employee ID" value={employee.employeeId} />
                      <FormField label="GSIS ID No." value={employee.gsisIdNo} />
                      <FormField label="PAG-IBIG ID No." value={employee.pagibigIdNo} />
                      <FormField label="PhilHealth No." value={employee.philhealthNo} />
                      <FormField label="SSS No." value={employee.sssNo} />
                      <FormField label="TIN No." value={employee.tinNo} />
                    </div>
                  </div>
                </div>
              </div>

              {/* II. FAMILY BACKGROUND */}
              <div className="avoid-break">
              <SectionTitle number="II">Family Background</SectionTitle>
              <div className="px-8 py-6 bg-white">
                {/* Parents */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3 pb-1 border-b-2 border-purple-200">Parents</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField label="Father's Name" value={employee.fatherName} />
                    <FormField label="Mother's Name" value={employee.motherName} />
                  </div>
                </div>

                {/* Spouse */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3 pb-1 border-b-2 border-purple-200">Spouse Information</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField label="Spouse Name" value={employee.spouseName} />
                    <FormField label="Spouse Occupation" value={employee.spouseOccupation} />
                  </div>
                </div>

                {/* Children */}
                {employee.children && employee.children.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3 pb-1 border-b-2 border-purple-200">Children</h4>
                    <div className="overflow-hidden border border-gray-300 rounded-lg shadow-sm">
                      <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 border-b border-gray-300">
                        <span className="text-xs font-semibold text-gray-700 uppercase">Name</span>
                        <span className="text-xs font-semibold text-gray-700 uppercase">Birthdate</span>
                      </div>
                      {employee.children.map((child, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-purple-50 transition-colors">
                          <span className="text-sm font-medium text-gray-800">{child.name || '—'}</span>
                          <span className="text-sm text-gray-700">{child.birthdate || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </div>

              {/* III. EDUCATIONAL BACKGROUND */}
              <div className="avoid-break">
              <SectionTitle number="III">Educational Background</SectionTitle>
              <div className="px-8 py-6 bg-white">
                {employee.education && employee.education.length > 0 ? (
                  <div className="overflow-hidden border border-gray-300 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 px-4 py-2 border-b border-gray-300">
                      <span className="text-xs font-semibold text-gray-600 uppercase">Degree/Program</span>
                      <span className="text-xs font-semibold text-gray-600 uppercase">School</span>
                      <span className="text-xs font-semibold text-gray-600 uppercase">Period</span>
                    </div>
                    {employee.education.map((ed, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                        <span className="text-sm font-medium text-gray-800">{ed.degree || '—'}</span>
                        <span className="text-sm text-gray-700">{ed.school || '—'}</span>
                        <span className="text-sm text-gray-600">{ed.period || '—'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic py-4 text-center">No educational records</p>
                )}
              </div>

              {/* IV. CIVIL SERVICE ELIGIBILITY */}
              {employee.eligibility && employee.eligibility.length > 0 && (
                <>
                  <SectionTitle number="IV">Civil Service Eligibility</SectionTitle>
                  <div className="px-8 py-6 bg-white">
                    <div className="overflow-hidden border border-gray-300 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 bg-gray-50 px-4 py-2 border-b border-gray-300">
                        <span className="text-xs font-semibold text-gray-600 uppercase">Title/License</span>
                        <span className="text-xs font-semibold text-gray-600 uppercase">Details</span>
                      </div>
                      {employee.eligibility.map((elig, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                          <span className="text-sm font-medium text-gray-800">{elig.title || '—'}</span>
                          <span className="text-sm text-gray-700">{elig.details || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              </div>

              {/* V. WORK EXPERIENCE */}
              <div className="avoid-break">
              <SectionTitle number="V">Work Experience</SectionTitle>
              <div className="px-8 py-6 bg-white">
                {employee.workExperience && employee.workExperience.length > 0 ? (
                  <div className="overflow-hidden border border-gray-300 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 px-4 py-2 border-b border-gray-300">
                      <span className="text-xs font-semibold text-gray-600 uppercase">Position</span>
                      <span className="text-xs font-semibold text-gray-600 uppercase">Company</span>
                      <span className="text-xs font-semibold text-gray-600 uppercase">Period</span>
                    </div>
                    {employee.workExperience.map((work, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                        <span className="text-sm font-medium text-gray-800">{work.position || '—'}</span>
                        <span className="text-sm text-gray-700">{work.company || '—'}</span>
                        <span className="text-sm text-gray-600">{work.period || '—'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic py-4 text-center">No work experience records</p>
                )}
              </div>

              {/* VI. TRAINING PROGRAMS */}
              {employee.trainings && employee.trainings.length > 0 && (
                <>
                  <SectionTitle number="VI">Training Programs Attended</SectionTitle>
                  <div className="px-8 py-6 bg-white">
                    <div className="overflow-hidden border border-gray-300 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 bg-gray-50 px-4 py-2 border-b border-gray-300">
                        <span className="text-xs font-semibold text-gray-600 uppercase">Training/Seminar</span>
                        <span className="text-xs font-semibold text-gray-600 uppercase">Date</span>
                      </div>
                      {employee.trainings.map((training, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                          <span className="text-sm text-gray-800">{training.title || '—'}</span>
                          <span className="text-sm text-gray-700">{training.date || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              </div>

              {/* VII. OTHER INFORMATION */}
              <div className="avoid-break">
              <SectionTitle number="VII">Other Information</SectionTitle>
              <div className="px-8 py-6 bg-white">
                <div className="space-y-3">
                  <FormField label="Skills & Hobbies" value={employee.otherInformation?.skills} />
                  <FormField label="Recognitions/Awards" value={employee.otherInformation?.recognitions} />
                  <FormField label="Organizations" value={employee.otherInformation?.memberships} />
                </div>
                {employee.references && employee.references.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">References</p>
                    <div className="overflow-hidden border border-gray-300 rounded-lg">
                      {employee.references.map((ref, idx) => (
                        <div key={idx} className="px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                          <p className="text-sm font-medium text-gray-800">{ref.name || '—'}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="inline-block mr-3">📞 {ref.contact || '—'}</span>
                            <span className="inline-block">📍 {ref.address || '—'}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </div>

              {/* VIII. ADDRESS */}
              <div className="avoid-break">
              <SectionTitle number="VIII">Residential & Permanent Address</SectionTitle>
              <div className="px-8 py-6 bg-white">
                <div className="mb-4">
                  <FormField label="Residential Address" value={employee.residentialAddress} />
                  <FormField label="ZIP Code" value={employee.residentialZip} />
                </div>
                <div>
                  <FormField label="Permanent Address" value={employee.permanentAddress} />
                  <FormField label="ZIP Code" value={employee.permanentZip} />
                </div>
              </div>
              </div>

              {/* EMPLOYMENT DETAILS */}
              <div className="avoid-break">
              <SectionTitle number="IX">Current Employment Details</SectionTitle>
              <div className="px-8 py-6 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Department" value={employee.Department?.name || 'Unassigned'} />
                  <FormField label="Designation" value={employee.Designation?.title || 'Unassigned'} />
                  <FormField label="Employment Status" value={employee.status} />
                  <FormField label="Date Joined" value={employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
                </div>
              </div>
              </div>
              
              {/* Bottom Spacing */}
              <div className="h-4 bg-gray-50"></div>

              {/* Footer - PDF Version */}
              <div className="px-8 py-4 border-t-2 border-gray-800 print-footer">
                <div className="flex justify-between items-end text-xs">
                  <div>
                    <p className="font-bold text-gray-800">King's College of the Philippines</p>
                    <p className="text-gray-600">Human Resources Department</p>
                    <p className="text-gray-500 mt-1">La Trinidad, Benguet</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-gray-500 text-xs mt-1">This is a system-generated document</p>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Footer - Print Version */}
            <div className="hidden print:block px-8 py-4 border-t-2 border-gray-800 mt-8">
              <div className="flex justify-between items-end text-xs">
                <div>
                  <p className="font-bold text-gray-800">King's College of the Philippines</p>
                  <p className="text-gray-600">Human Resources Department</p>
                  <p className="text-gray-500 mt-1">La Trinidad, Benguet</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-gray-500 text-xs mt-1">This is a system-generated document</p>
                </div>
              </div>
            </div>

            {/* Footer - Screen Version */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-8 py-4 border-t-2 border-gray-300 flex justify-between items-center no-print">
              <div className="text-xs text-gray-600">
                <p className="font-semibold">King's College of the Philippines</p>
                <p className="text-gray-500">Human Resources Department</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={exporting}
                  className="px-5 py-2.5 bg-white border-2 border-purple-600 text-purple-600 text-sm font-semibold rounded-lg hover:bg-purple-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-white border-2 border-gray-400 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                >
                  Print
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-gray-500">
            <User size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Employee not found</p>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
