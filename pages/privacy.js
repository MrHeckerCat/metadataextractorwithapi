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

        {/* Section 4 */}
        <section className={styles.content}>
          <h2 id="section4" onClick={() => toggleSection('section4')}>4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
          {activeSection === 'section4' && (
            <>
              <p><strong>In Short:</strong> We may share information in specific situations described in this section and/or with the following categories of third parties.</p>
              <h3>Vendors, Consultants, and Other Third-Party Service Providers.</h3>
              <p>We may share your data with third-party vendors, service providers, contractors, or agents ("third parties") who perform services for us or on our behalf and require access to such information to do that work.</p>
              <p>The categories of third parties we may share personal information with are as follows:</p>
              <ul>
                <li>Data Analytics Services</li>
              </ul>
              <p>We also may need to share your personal information in the following situations:</p>
              <ul>
                <li>Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
              </ul>
            </>
          )}
        </section>

        {/* Section 5 */}
        <section className={styles.content}>
          <h2 id="section5" onClick={() => toggleSection('section5')}>5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
          {activeSection === 'section5' && (
            <>
              <p><strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.</p>
              <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</p>
              <p>We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences). The third parties and service providers use their technology to provide advertising about products and services tailored to your interests which may appear either on our Services or on other websites.</p>
              <p>To the extent these online tracking technologies are deemed to be a "sale"/"sharing" (which includes targeted advertising, as defined under the applicable laws) under applicable US state laws, you can opt out of these online tracking technologies by submitting a request as described below under section "DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?".</p>
              <p>Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.</p>
              <h3>Google Analytics</h3>
              <p>We may share your information with Google Analytics to track and analyze the use of the Services. The Google Analytics Advertising Features that we may use include: Google Analytics Demographics and Interests Reporting. To opt out of being tracked by Google Analytics across the Services, visit <Link href="https://tools.google.com/dlpage/gaoptout">https://tools.google.com/dlpage/gaoptout</Link>. You can opt out of Google Analytics Advertising Features through Ads Settings and Ad Settings for mobile apps. Other opt out means include <Link href="http://optout.networkadvertising.org/">http://optout.networkadvertising.org/</Link> and <Link href="http://www.networkadvertising.org/mobile-choice">http://www.networkadvertising.org/mobile-choice</Link>. For more information on the privacy practices of Google, please visit the Google Privacy & Terms page.</p>
            </>
          )}
        </section>

        {/* Section 6 */}
        <section className={styles.content}>
          <h2 id="section6" onClick={() => toggleSection('section6')}>6. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
          {activeSection === 'section6' && (
            <>
              <p><strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</p>
              <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).</p>
              <p>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.</p>
            </>
          )}
        </section>

        {/* Section 7 */}
        <section className={styles.content}>
          <h2 id="section7" onClick={() => toggleSection('section7')}>7. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
          {activeSection === 'section7' && (
            <>
              <p><strong>In Short:</strong> We aim to protect your personal information through a system of organizational and technical security measures.</p>
              <p>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.</p>
            </>
          )}
        </section>

        {/* Section 8 */}
        <section className={styles.content}>
          <h2 id="section8" onClick={() => toggleSection('section8')}>8. DO WE COLLECT INFORMATION FROM MINORS?</h2>
          {activeSection === 'section8' && (
            <>
              <p><strong>In Short:</strong> We do not knowingly collect data from or market to children under 18 years of age.</p>
              <p>We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at info@imagedataextract.com.</p>
            </>
          )}
        </section>

        {/* Section 9 */}
        <section className={styles.content}>
          <h2 id="section9" onClick={() => toggleSection('section9')}>9. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
          {activeSection === 'section9' && (
            <>
              <p><strong>In Short:</strong> Depending on your state of residence in the US or in some regions, such as the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</p>
              <p>In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below.</p>
              <p>We will consider and act upon any request in accordance with applicable data protection laws.</p>
              <p><strong>If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your Member State data protection authority or UK data protection authority.</strong></p>
              <p><strong>If you are located in Switzerland, you may contact the Federal Data Protection and Information Commissioner.</strong></p>
              <p><strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below.</p>
              <p>However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.</p>
              <p><strong>Cookies and similar technologies:</strong> Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services.</p>
              <p>If you have questions or comments about your privacy rights, you may email us at info@imagedataextract.com.</p>
            </>
          )}
        </section>

        {/* Section 10 */}
        <section className={styles.content}>
          <h2 id="section10" onClick={() => toggleSection('section10')}>10. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
          {activeSection === 'section10' && (
            <>
              <p>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.</p>
              <p>California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for recognizing or honoring DNT signals, we do not respond to them at this time.</p>
            </>
          )}
        </section>

        {/* Section 11 */}
        <section className={styles.content}>
          <h2 id="section11" onClick={() => toggleSection('section11')}>11. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
          {activeSection === 'section11' && (
            <>
              <p><strong>In Short:</strong> If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Montana, New Hampshire, New Jersey, Oregon, Tennessee, Texas, Utah, or Virginia, you may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. More information is provided below.</p>
              <h3>Categories of Personal Information We Collect</h3>
              <p>We have collected the following categories of personal information in the past twelve (12) months:</p>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Examples</th>
                    <th>Collected</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A. Identifiers</td>
                    <td>Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>B. Personal information as defined in the California Customer Records statute</td>
                    <td>Name, contact information, education, employment, employment history, and financial information</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>C. Protected classification characteristics under state or federal law</td>
                    <td>Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>D. Commercial information</td>
                    <td>Transaction information, purchase history, financial details, and payment information</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>E. Biometric information</td>
                    <td>Fingerprints and voiceprints</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>F. Internet or other similar network activity</td>
                    <td>Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>G. Geolocation data</td>
                    <td>Device location</td>
                    <td>YES</td>
                  </tr>
                  <tr>
                    <td>H. Audio, electronic, sensory, or similar information</td>
                    <td>Images and audio, video or call recordings created in connection with our business activities</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>I. Professional or employment-related information</td>
                    <td>Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>J. Education Information</td>
                    <td>Student records and directory information</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>K. Inferences drawn from collected personal information</td>
                    <td>Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics</td>
                    <td>NO</td>
                  </tr>
                  <tr>
                    <td>L. Sensitive personal Information</td>
                    <td></td>
                    <td>NO</td>
                  </tr>
                </tbody>
              </table>
              <p>We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:</p>
              <ul>
                <li>Receiving help through our customer support channels;</li>
                <li>Participation in customer surveys or contests; and</li>
                <li>Facilitation in the delivery of our Services and to respond to your inquiries.</li>
              </ul>
              <p>We will use and retain the collected personal information as needed to provide the Services or for:</p>
              <ul>
                <li>Category G - 6 months</li>
              </ul>
              <h3>Sources of Personal Information</h3>
              <p>Learn more about the sources of personal information we collect in "WHAT INFORMATION DO WE COLLECT?".</p>
              <h3>How We Use and Share Personal Information</h3>
              <p>Learn about how we use your personal information in the section, "HOW DO WE PROCESS YOUR INFORMATION?".</p>
              <p>We collect and share your personal information through:</p>
              <ul>
                <li>Targeting cookies/Marketing cookies</li>
              </ul>
              <h3>Will your information be shared with anyone else?</h3>
              <p>We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Learn more about how we disclose personal information to in the section, "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?".</p>
              <p>We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be "selling" of your personal information.</p>
              <p>We have not sold or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. We have disclosed the following categories of personal information to third parties for a business or commercial purpose in the preceding twelve (12) months:</p>
              <ul>
                <li>Geolocation data</li>
              </ul>
              <p>The categories of third parties to whom we disclosed personal information for a business or commercial purpose can be found under "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?".</p>
              <h3>Your Rights</h3>
              <p>You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:</p>
              <ul>
                <li>Right to know whether or not we are processing your personal data</li>
                <li>Right to access your personal data</li>
                <li>Right to correct inaccuracies in your personal data</li>
                <li>Right to request the deletion of your personal data</li>
                <li>Right to obtain a copy of the personal data you previously shared with us</li>
                <li>Right to non-discrimination for exercising your rights</li>
                <li>Right to opt out of the processing of your personal data if it is used for targeted advertising (or sharing as defined under California’s privacy law), the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects ("profiling")</li>
              </ul>
              <p>Depending upon the state where you live, you may also have the following rights:</p>
              <ul>
                <li>Right to obtain a list of the categories of third parties to which we have disclosed personal data (as permitted by applicable law, including California's and Delaware's privacy law)</li>
                <li>Right to obtain a list of specific third parties to which we have disclosed personal data (as permitted by applicable law, including Oregon’s privacy law)</li>
                <li>Right to limit use and disclosure of sensitive personal data (as permitted by applicable law, including California’s privacy law)</li>
                <li>Right to opt out of the collection of sensitive data and personal data collected through the operation of a voice or facial recognition feature (as permitted by applicable law, including Florida’s privacy law)</li>
              </ul>
              <h3>How to Exercise Your Rights</h3>
              <p>To exercise these rights, you can contact us by submitting a data subject access request, by emailing us at info@imagedataextract.com, or by referring to the contact details at the bottom of this document.</p>
              <p>Under certain US state data protection laws, you can designate an authorized agent to make a request on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with applicable laws.</p>
              <h3>Request Verification</h3>
              <p>Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. We will only use personal information provided in your request to verify your identity or authority to make the request. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes.</p>
              <p>If you submit the request through an authorized agent, we may need to collect additional information to verify your identity before processing your request and the agent will need to provide a written and signed permission from you to submit such request on your behalf.</p>
              <h3>Appeals</h3>
              <p>Under certain US state data protection laws, if we decline to take action regarding your request, you may appeal our decision by emailing us at info@imagedataextract.com. We will inform you in writing of any action taken or not taken in response to the appeal, including a written explanation of the reasons for the decisions. If your appeal is denied, you may submit a complaint to your state attorney general.</p>
              <h3>California "Shine The Light" Law</h3>
              <p>California Civil Code Section 1798.83, also known as the "Shine The Light" law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information</p>
