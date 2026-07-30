/** Copied from https://web2autos.com/terms (web2autos-next). */
export type TermsSection = {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
    paragraphsAfter?: string[];
    privacyPolicyLink?: boolean;
};

export const TERMS_LAST_UPDATED = 'June 12, 2025';

export const TERMS_INTRO =
    'Welcome to Web2Autos.com ("Site"). Please read these Terms of Use ("Terms") carefully before using the Site. By accessing or submitting information through this Site, you agree to comply with and be bound by the following Terms and Conditions.';

export const TERMS_SECTIONS: TermsSection[] = [
    {
        title: '1. Services Provided',
        paragraphs: [
            'Web2Autos is a marketing and lead generation platform that connects consumers with participating auto dealerships and finance providers. We are not a lender, auto broker, or dealership and do not sell vehicles or make credit decisions. All loan or financing offers are made solely by licensed third-party providers.',
        ],
    },
    {
        title: '2. No Guarantee of Financing or Approval',
        paragraphs: [
            'Submitting an application does not guarantee credit approval, pre-qualification, specific financing terms, or vehicle availability. All decisions regarding financing, down payment, and vehicle selection are made exclusively by the third-party dealer or lender to whom your information is submitted.',
        ],
    },
    {
        title: '3. Consumer Responsibilities',
        paragraphs: ['By using this Site, you agree to:'],
        bullets: [
            'Provide accurate, complete, and truthful information',
            'Only submit your own information (not on behalf of others without consent)',
            'Refrain from using the Site for any unlawful, fraudulent, or abusive purposes',
            'Not interfere with or disrupt the integrity or performance of the Site or its services',
        ],
    },
    {
        title: '4. Use of Personal Information',
        paragraphs: [
            'Your information may be shared with one or more third-party dealerships or financing providers for the purpose of matching you with a potential financing opportunity.',
        ],
        privacyPolicyLink: true,
    },
    {
        title: '5. No Agency Relationship',
        paragraphs: [
            'Your use of the Site does not create any agency, partnership, or joint venture between you and Web2Autos. We act solely as a platform to connect consumers and dealers and are not responsible for the outcome of any transaction or financing decision.',
        ],
    },
    {
        title: '6. Limitation of Liability',
        paragraphs: ['Web2Autos is not liable for:'],
        bullets: [
            'Any financing decisions made by third parties',
            'Delays, system errors, or interruptions in site access',
            'Any direct, indirect, incidental, or consequential damages arising from use of this Site',
        ],
        paragraphsAfter: ['You use the Site at your own risk.'],
    },
    {
        title: '7. Governing Law',
        paragraphs: [
            'These Terms shall be governed by and interpreted in accordance with the laws of the State of California, without regard to its conflict of law rules.',
        ],
    },
    {
        title: '8. Dispute Resolution (Binding Arbitration)',
        paragraphs: [
            'Any disputes arising out of or related to your use of the Site shall be resolved through binding arbitration in California, under the rules of the American Arbitration Association. By using the Site, you waive your right to a jury trial or to participate in a class action lawsuit.',
        ],
    },
    {
        title: '9. Indemnification',
        paragraphs: [
            'You agree to indemnify, defend, and hold harmless Web2Autos, its affiliates, partners, and employees from any liability, damages, losses, or expenses (including legal fees) arising out of your misuse of the Site or violation of these Terms.',
        ],
    },
    {
        title: '10. Termination',
        paragraphs: [
            'Web2Autos may suspend or terminate your access to the Site at any time without notice if we believe you have violated these Terms or misused our services.',
        ],
    },
    {
        title: '11. Modifications to Terms',
        paragraphs: [
            'We reserve the right to modify these Terms at any time. Any updates will be posted on this page with the new effective date. Your continued use of the Site constitutes acceptance of the updated Terms.',
        ],
    },
    {
        title: '12. Contact Information',
        paragraphs: [
            'If you have questions or concerns about these Terms, please contact:',
        ],
    },
];
