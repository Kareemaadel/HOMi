import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFContractData {
    id: string;
    property: string;
    propertyAddress: string;
    propertyType: string;
    landlord: string;
    landlordNationalId?: string;
    landlordAddress?: string;
    tenant: string;
    tenantNationalId?: string;
    tenantAddress?: string;
    startDate: string;
    duration: string;
    amount: number;
    deposit: number;
    lateFeeAmount?: number;
    permittedUse?: string;
    rightToEnter?: string;
    noticePeriod?: string;
    maintenanceResponsibilities?: Array<{ area: string; responsible_party: string }>;
    landlordSignature?: string;
    tenantSignature?: string;
    executionDate: string;
}

class PDFService {
    async generateContractPDF(data: PDFContractData, lang: 'en' | 'ar') {
        const isAr = lang === 'ar';
        
        // Helper for styles
        const styles = `
            .pdf-page {
                width: 210mm;
                min-height: 297mm;
                padding: 20mm;
                background: white;
                color: #1a1a1a;
                font-family: ${isAr ? '"Segoe UI", Tahoma, Arial, sans-serif' : 'serif'};
                box-sizing: border-box;
                position: relative;
                display: flex;
                flex-direction: column;
            }
            .pdf-header {
                text-align: center;
                border-bottom: 2px solid #2c3e50;
                padding-bottom: 15px;
                margin-bottom: 25px;
            }
            .pdf-header h1 {
                margin: 0;
                font-size: 28px;
                color: #2c3e50;
                letter-spacing: ${isAr ? '0' : '1px'};
                font-weight: bold;
                line-height: 1.2;
            }
            .pdf-header .ref-no {
                font-size: 14px;
                color: #7f8c8d;
                margin-top: 8px;
            }
            .section {
                margin-bottom: 25px;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #2c3e50;
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 8px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: ${isAr ? '0' : '0.5px'};
            }
            .data-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                font-size: 14px;
            }
            .data-item {
                margin-bottom: 10px;
            }
            .data-label {
                font-weight: bold;
                color: #34495e;
                display: block;
                margin-bottom: 4px;
                font-size: 12px;
                text-transform: uppercase;
            }
            .data-value {
                color: #2c3e50;
                font-size: 15px;
            }
            .party-card {
                border: 1px solid #ecf0f1;
                padding: 15px;
                border-radius: 8px;
                background: #fdfdfd;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }
            .clause-list {
                font-size: 14px;
                line-height: 1.7;
                color: #2c3e50;
            }
            .clause-item {
                margin-bottom: 15px;
                text-align: justify;
                padding-bottom: 8px;
                border-bottom: 1px solid #f9f9f9;
            }
            .signature-area {
                margin-top: auto;
                display: flex;
                justify-content: space-between;
                padding-top: 40px;
            }
            .sig-box {
                width: 45%;
                text-align: center;
                border: 1px solid #eee;
                padding: 20px;
                border-radius: 10px;
                background: #fafafa;
            }
            .sig-img {
                max-width: 200px;
                max-height: 80px;
                margin: 15px 0;
            }
            .footer {
                margin-top: 25px;
                text-align: center;
                font-size: 11px;
                color: #95a5a6;
                border-top: 1px solid #ecf0f1;
                padding-top: 15px;
                letter-spacing: 0.5px;
            }
            [dir="rtl"] .section-title { text-align: right; }
            [dir="rtl"] .data-grid { text-align: right; }
            [dir="rtl"] .clause-item { text-align: right; }
        `;

        const t = {
            en: {
                title: 'RESIDENTIAL LEASE AGREEMENT',
                ref: 'Contract Ref',
                sec1: '1. PARTIES INVOLVED',
                lessor: 'Lessor (Landlord)',
                lessee: 'Lessee (Tenant)',
                sec2: '2. PROPERTY & TERMS',
                sec3: '3. FINANCIAL OBLIGATIONS',
                sec4: '4. RULES & PERMISSIONS',
                sec5: '5. LEGAL CLAUSES & COVENANTS',
                sec6: '6. EXECUTION & SIGNATURES',
                id: 'National ID',
                address: 'Primary Address',
                propAddr: 'Property Address',
                propType: 'Property Type',
                startDate: 'Lease Start Date',
                duration: 'Lease Duration',
                monthlyRent: 'Monthly Rent Amount',
                securityDeposit: 'Security Deposit',
                lateFee: 'Late Fee Penalty',
                permittedUse: 'Permitted Use',
                rightToEnter: 'Access/Entry Rights',
                notice: 'Notice Period',
                signature: 'Digital Signature',
                date: 'Execution Date',
                footer: 'Digitally Verified Agreement • HOMI Platform • Timestamped Security',
                clause1: '1. Description: The property is located at {{address}}. It consists of the unit specified ({{type}}).',
                clause2: '2. Duration: The contract starts on {{startDate}} and has a duration of {{duration}}.',
                clause3: '3. Value: The monthly rent is {{amount}}. It must be paid in advance at the beginning of each month.',
                clause4: '4. Deposit: A security deposit of {{deposit}} is paid. Refundable if no damages or unpaid bills.',
                clause5: '5. Late Payment: A late fee of {{lateFee}} applies if payment is delayed more than 5 days.',
                clause6: '6. No Subleasing: Lessee cannot sublease or make changes without written consent.',
                clause7: '7. Use: Property must be used for residential purposes only. Any other use terminates contract.',
                clause8: '8. Expenses: Lessee expenses (decorations/improvements) are not reimbursable by lessor.',
                clause9: '9. Condition: Lessee must return property in original condition. Liable for negligence.',
                clause10: '10. Eviction: Lessee must vacate at end of term. Delay results in illegal occupation.',
                clause11: '11. Utilities: Lessee is responsible for water, electricity, gas, and internet bills.',
                clause12: '12. Termination: Early termination requires one month notice or one month rent penalty.',
                clause13: '13. Correspondence: Addresses in contract are valid for all legal notices.',
                clause14: '14. Jurisdiction: Digital copies provided to both parties. Subject to local courts.'
            },
            ar: {
                title: 'عقد إيجار وحدة سكنية',
                ref: 'رقم مرجع العقد',
                sec1: '1. أطراف التعاقد',
                lessor: 'المؤجر (الطرف الأول)',
                lessee: 'المستأجر (الطرف الثاني)',
                sec2: '2. بيانات العقار والمدة',
                sec3: '3. الالتزامات المالية',
                sec4: '4. القواعد والأذونات',
                sec5: '5. البنود القانونية',
                sec6: '6. التوقيع والتنفيذ',
                id: 'الرقم القومي',
                address: 'العنوان الحالي',
                propAddr: 'عنوان العقار المؤجر',
                propType: 'نوع العقار',
                startDate: 'تاريخ بداية العقد',
                duration: 'مدة التعاقد',
                monthlyRent: 'القيمة الإيجارية الشهرية',
                securityDeposit: 'مبلغ التأمين',
                lateFee: 'غرامة التأخير',
                permittedUse: 'الغرض من الاستخدام',
                rightToEnter: 'حق الدخول للمعاينة',
                notice: 'مدة الإخطار المسبق',
                signature: 'التوقيع الرقمي',
                date: 'تاريخ التوقيع',
                footer: 'عقد موثق رقمياً • منصة هومي (HOMI) • حماية تقنية وتوقيع زمنى',
                clause1: '1. الوصف: يقع العقار في {{address}}. ويتكون من الوحدة المحددة ({{type}}).',
                clause2: '2. المدة: يبدأ العقد في {{startDate}} ومدته {{duration}}.',
                clause3: '3. القيمة: مبلغ الإيجار الشهري هو {{amount}}. يجب دفعه مقدماً في بداية كل شهر.',
                clause4: '4. التأمين: يتم دفع تأمين قدره {{deposit}}. يسترد إذا لم تكن هناك أضرار أو فواتير.',
                clause5: '5. التأخير: تطبق غرامة {{lateFee}} في حال التأخر عن الدفع لأكثر من 5 أيام.',
                clause6: '6. التنازل: لا يجوز للمستأجر التنازل عن الإيجار أو تغيير العقار دون موافقة.',
                clause7: '7. الاستخدام: يستخدم العقار للسكن فقط. أي استخدام آخر ينهي العقد تلقائياً.',
                clause8: '8. المصاريف: مصاريف المستأجر (تحسينات/ديكور) لا يستردها وتصبح جزءاً من العقار.',
                clause9: '9. الحالة: يجب إعادة العقار بحالته الأصلية. المستأجر مسؤول عن أي إهمال.',
                clause10: '10. الإخلاء: يجب الإخلاء عند انتهاء العقد. التأخير يعتبر شغلاً غير قانوني.',
                clause11: '11. المرافق: المستأجر مسؤول عن دفع فواتير الكهرباء والمياه والغاز والإنترنت.',
                clause12: '12. الإنهاء: يتطلب الإنهاء المبكر إخطاراً قبل شهر أو دفع إيجار شهر غرامة.',
                clause13: '13. المراسلات: العناوين المذكورة صحيحة لجميع الإخطارات القانونية والمراسلات.',
                clause14: '14. الاختصاص: نسختان رقميتان للطرفين. يخضع العقد للمحاكم المحلية.'
            }
        }[lang];

        const replace = (text: string, values: any) => text.replace(/{{(\w+)}}/g, (_, k) => values[k] || '');
        const clauses = [
            replace(t.clause1, { address: data.propertyAddress, type: data.propertyType }),
            replace(t.clause2, { startDate: data.startDate, duration: data.duration }),
            replace(t.clause3, { amount: `$${data.amount}` }),
            replace(t.clause4, { deposit: `$${data.deposit}` }),
            replace(t.clause5, { lateFee: `$${data.lateFeeAmount || 0}` }),
            t.clause6, t.clause7, t.clause8, t.clause9, t.clause10, t.clause11, t.clause12, t.clause13, t.clause14
        ];

        const renderPage = (content: string) => `
            <div class="pdf-page" dir="${isAr ? 'rtl' : 'ltr'}">
                <style>${styles}</style>
                <div class="pdf-header">
                    <h1>${t.title}</h1>
                    <div class="ref-no">${t.ref}: ${data.id}</div>
                </div>
                ${content}
                <div class="footer">${t.footer}</div>
            </div>
        `;

        const page1Content = `
            <div class="section">
                <div class="section-title">${t.sec1}</div>
                <div class="data-grid">
                    <div class="party-card">
                        <span class="data-label">${t.lessor}</span>
                        <span class="data-value" style="font-size: 15px; font-weight: bold;">${data.landlord}</span><br/>
                        <span class="data-label" style="margin-top: 8px;">${t.id}:</span> <span class="data-value">${data.landlordNationalId || '—'}</span><br/>
                        <span class="data-label">${t.address}:</span> <span class="data-value">${data.landlordAddress || '—'}</span>
                    </div>
                    <div class="party-card">
                        <span class="data-label">${t.lessee}</span>
                        <span class="data-value" style="font-size: 15px; font-weight: bold;">${data.tenant}</span><br/>
                        <span class="data-label" style="margin-top: 8px;">${t.id}:</span> <span class="data-value">${data.tenantNationalId || '—'}</span><br/>
                        <span class="data-label">${t.address}:</span> <span class="data-value">${data.tenantAddress || '—'}</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">${t.sec2}</div>
                <div class="data-grid">
                    <div class="data-item"><span class="data-label">${t.propAddr}</span><span class="data-value">${data.propertyAddress}</span></div>
                    <div class="data-item"><span class="data-label">${t.propType}</span><span class="data-value">${data.propertyType}</span></div>
                    <div class="data-item"><span class="data-label">${t.startDate}</span><span class="data-value">${data.startDate}</span></div>
                    <div class="data-item"><span class="data-label">${t.duration}</span><span class="data-value">${data.duration}</span></div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">${t.sec3}</div>
                <div class="data-grid" style="grid-template-columns: repeat(3, 1fr);">
                    <div class="data-item"><span class="data-label">${t.monthlyRent}</span><span class="data-value" style="font-size: 18px; color: #27ae60; font-weight: bold;">$${data.amount}</span></div>
                    <div class="data-item"><span class="data-label">${t.securityDeposit}</span><span class="data-value" style="font-size: 18px; color: #2980b9; font-weight: bold;">$${data.deposit}</span></div>
                    <div class="data-item"><span class="data-label">${t.lateFee}</span><span class="data-value" style="font-size: 18px; color: #c0392b; font-weight: bold;">$${data.lateFeeAmount || 0}</span></div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">${t.sec4}</div>
                <div class="data-grid">
                    <div class="data-item"><span class="data-label">${t.permittedUse}</span><span class="data-value">${data.permittedUse || 'Residential'}</span></div>
                    <div class="data-item"><span class="data-label">${t.rightToEnter}</span><span class="data-value">${data.rightToEnter || 'With 24h Notice'}</span></div>
                    <div class="data-item"><span class="data-label">${t.notice}</span><span class="data-value">${data.noticePeriod || '24 Hours'}</span></div>
                </div>
            </div>
        `;

        const page2Content = `
            <div class="section">
                <div class="section-title">${t.sec5}</div>
                <div class="clause-list">
                    ${clauses.map(c => `<div class="clause-item">${c}</div>`).join('')}
                </div>
            </div>

            <div class="section signature-area">
                <div class="sig-box">
                    <span class="data-label">${t.landlordSig}</span>
                    ${data.landlordSignature ? `<img src="${data.landlordSignature}" class="sig-img" />` : '<div style="height: 70px; border: 1px dashed #ccc; margin: 10px 0;"></div>'}
                    <div style="font-size: 11px;">${t.date}: ${data.executionDate}</div>
                </div>
                <div class="sig-box">
                    <span class="data-label">${t.tenantSig}</span>
                    ${data.tenantSignature ? `<img src="${data.tenantSignature}" class="sig-img" />` : '<div style="height: 70px; border: 1px dashed #ccc; margin: 10px 0;"></div>'}
                    <div style="font-size: 11px;">${t.date}: ${data.executionDate}</div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.innerHTML = renderPage(page1Content) + renderPage(page2Content);
        document.body.appendChild(container);

        try {
            const pages = container.querySelectorAll('.pdf-page');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            for (let i = 0; i < pages.length; i++) {
                const canvas = await html2canvas(pages[i] as HTMLElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });
                const imgData = canvas.toDataURL('image/png');
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            }
            
            pdf.save(`${data.property.replace(/\s+/g, '_')}_Contract_${lang}.pdf`);
        } finally {
            document.body.removeChild(container);
        }
    }
}

export default new PDFService();
