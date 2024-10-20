import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import styles from '../styles/Legal.module.css';

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Privacy Policy - Image Metadata Extractor</title>
        <meta name="description" content="Privacy Policy for Image Metadata Extractor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>PRIVACY POLICY</h1>
        <p className={styles.lastUpdated}>Last updated September 06, 2024</p>

        <section className={styles.content}>
          <p>This Privacy Notice for <Link href="https://imagedataextract.com/">https://imagedataextract.com/</Link> ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:</p>
          
          <ul>
            <li>Visit our website at <Link href="https://imagedataextract.com">https://imagedataextract.com</Link>, or any website of ours that links to this Privacy Notice</li>
            <li>Engage with us in other related ways, including any sales, marketing, or events</li>
          </ul>
          
          <p><strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at info@imagedataextract.com.</p>
        </section>

        <section className={styles.content}>
          <h2>SUMMARY OF KEY POINTS</h2>
          <p>This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for.</p>
          
          <ul>
            <li><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</li>
            <li><strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</li>
            <li><strong>Do we receive any information from third parties?</strong> We do not receive any information from third parties.</li>
            <li><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so.</li>
            <li><strong>In what situations and with which types of parties do we share personal information?</strong> We may share information in specific situations and with specific categories of third parties.</li>
            <li><strong>How do we keep your information safe?</strong> We have organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.</li>
            <li><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</li>
            <li><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a data subject access request, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</li>
          </ul>
        </section>

        <section className={styles.content}>
          <h2>TABLE OF CONTENTS</h2>
          <ol>
            <li><a href="#" onClick={() => toggleSection('section1')}>WHAT INFORMATION DO WE COLLECT?</a></li>
            <li><a href="#" onClick={() => toggleSection('section2')}>HOW DO WE PROCESS YOUR INFORMATION?</a></li>
            <li><a href="#" onClick={() => toggleSection('section3')}>WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a></li>
            <li><a href="#" onClick={() => toggleSection('section4')}>WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
            <li><a href="#" onClick={() => toggleSection('section5')}>DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></li>
            <li><a href="#" onClick={() => toggleSection('section6')}>HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
            <li><a href="#" onClick={() => toggleSection('section7')}>HOW DO WE KEEP YOUR INFORMATION SAFE?</a></li>
            <li><a href="#" onClick={() => toggleSection('section8')}>DO WE COLLECT INFORMATION FROM MINORS?</a></li>
            <li><a href="#" onClick={() => toggleSection('section9')}>WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
            <li><a href="#" onClick={() => toggleSection('section10')}>CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
            <li><a href="#" onClick={() => toggleSection('section11')}>DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a></li>
            <li><a href="#" onClick={() => toggleSection('section12')}>DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
            <li><a href="#" onClick={() => toggleSection('section13')}>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
            <li><a href="#" onClick={() => toggleSection('section14')}>HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></li>
          </ol>
        </section>

        {/* Section 1 */}
        <section className={styles.content}>
          <h2 id="section1" onClick={() => toggleSection('section1')}>1. WHAT INFORMATION DO WE COLLECT?</h2>
          {activeSection === 'section1' && (
            <>
              <h3>Personal information you disclose to us</h3>
              <p><strong>In Short:</strong> We collect personal information that you provide to us.</p>
              <p>We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
              <p><strong>Sensitive Information.</strong> We do not process sensitive information.</p>
              <p>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</p>
              
              <h3>Information automatically collected</h3>
              <p><strong>In Short:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</p>
              <p>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.</p>
              <p>Like many businesses, we also collect information through cookies and similar technologies.</p>
              <p>The information we collect includes:</p>
              <ul>
                <li><strong>Log and Usage Data.</strong> Log and usage data is service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services and which we record in log files. Depending on how you interact with us, this log data may include your IP address, device information, browser type, and settings and information about your activity in the Services (such as the date/time stamps associated with your usage, pages and files viewed, searches, and other actions you take such as which features you use), device event information (such as system activity, error reports (sometimes called "crash dumps"), and hardware settings).</li>
                <li><strong>Device Data.</strong> We collect device data such as information about your computer, phone, tablet, or other device you use to access the Services. Depending on the device used, this device data may include information such as your IP address (or proxy server), device and application identification numbers, location, browser type, hardware model, Internet service provider and/or mobile carrier, operating system, and system configuration information.</li>
                <li><strong>Location Data.</strong> We collect location data such as information about your device's location, which can be either precise or imprecise. How much information we collect depends on the type and settings of the device you use to access the Services. For example, we may use GPS and other technologies to collect geolocation data that tells us your current location (based on your IP address). You can opt out of allowing us to collect this information either by refusing access to the information or by disabling your Location setting on your device. However, if you choose to opt out, you may not be able to use certain aspects of the Services.</li>
              </ul>
            </>
          )}
        </section>

        {/* Section 2 */}
        <section className={styles.content}>
          <h2 id="section2" onClick={() => toggleSection('section2')}>2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
          {activeSection === 'section2' && (
            <>
              <p><strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</p>
              <p>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</p>
              <ul>
                <li>To protect our Services. We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.</li>
                <li>To identify usage trends. We may process information about how you use our Services to better understand how they are being used so we can improve them.</li>
                <li>To determine the effectiveness of our marketing and promotional campaigns. We may process your information to better understand how to provide marketing and promotional campaigns that are most relevant to you.</li>
                <li>To save or protect an individual's vital interest. We may process your information when necessary to save or protect an individual's vital interest, such as to prevent harm.</li>
              </ul>
            </>
          )}
        </section>

        {/* Section 3 */}
        <section className={styles.content}>
          <h2 id="section3" onClick={() => toggleSection('section3')}>3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</h2>
          {activeSection === 'section3' && (
            <>
              <p><strong>In Short:</strong> We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.</p>
              <p><strong>If you are located in the EU or UK, this section applies to you.</strong></p>
              <p>The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:</p>
              <ul>
                <li><strong>Consent.</strong> We may process your information if you have given us permission (i.e., consent) to use your personal information for a specific purpose. You can withdraw your consent at any time.</li>
                <li><strong>Legitimate Interests.</strong> We may process your information when we believe it is reasonably necessary to achieve our legitimate business interests and those interests do not outweigh your interests and fundamental rights and freedoms. For example, we may process your personal information for some of the purposes described in order to:
                  <ul>
                    <li>Analyze how our Services are used so we can improve them to engage and retain users</li>
                    <li>Support our marketing activities</li>
                    <li>Diagnose problems and/or prevent fraudulent activities</li>
                  </ul>
                </li>
                <li><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.</li>
                <li><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.</li>
              </ul>
              <p><strong>If you are located in Canada, this section applies to you.</strong></p>
              <p>We may process your information if you have given us specific permission (i.e., express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e., implied consent). You can withdraw your consent at any time.</p>
              <p>In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:</p>
              <ul>
                <li>If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way</li>
                <li>For investigations and fraud detection and prevention</li>
                <li>For business transactions provided certain conditions are met</li>
                <li>If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim</li>
                <li>For identifying injured, ill, or deceased persons and communicating with next of kin</li>
                <li>If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse</li>
                <li>If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province</li>
                <li>If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records</li>
                <li>If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced</li>
                <li>If the collection is solely for journalistic, artistic, or literary purposes</li>
                <li>If the information is publicly available and is specified by the regulations</li>
              </ul>
            </>
          )}
        </section>

        {/* Sections 4-14 */}
        {/* Add the remaining sections here, following the same pattern as above */}

        <section className={styles.content}>
          <h2 id="section13" onClick={() => toggleSection('section13')}>13. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
          {activeSection === 'section13' && (
            <p>If you have questions or comments about this notice, you may email us at info@imagedataextract.com</p>
          )}
        </section>
