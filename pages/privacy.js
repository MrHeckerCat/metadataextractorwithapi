import React from 'react';
import Head from 'next/head';
import styles from '../styles/Legal.module.css';

export default function Privacy() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Privacy Policy - Image Metadata Extractor</title>
        <meta name="description" content="Privacy Policy for Image Metadata Extractor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div dangerouslySetInnerHTML={{ __html: `
          <style>
            [data-custom-class='body'], [data-custom-class='body'] * {
              background: transparent !important;
            }
            [data-custom-class='title'], [data-custom-class='title'] * {
              font-family: Arial !important;
              font-size: 26px !important;
              color: #000000 !important;
            }
            [data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
              font-family: Arial !important;
              color: #595959 !important;
              font-size: 14px !important;
            }
            [data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
              font-family: Arial !important;
              font-size: 19px !important;
              color: #000000 !important;
            }
            [data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
              font-family: Arial !important;
              font-size: 17px !important;
              color: #000000 !important;
            }
            [data-custom-class='body_text'], [data-custom-class='body_text'] * {
              color: #595959 !important;
              font-size: 14px !important;
              font-family: Arial !important;
            }
            [data-custom-class='link'], [data-custom-class='link'] * {
              color: #3030F1 !important;
              font-size: 14px !important;
              font-family: Arial !important;
              word-break: break-word !important;
            }
          </style>
          <div data-custom-class="body">
            <div><strong><span style="font-size: 26px;"><span data-custom-class="title">PRIVACY POLICY</span></span></strong></div>
            <div><br></div>
            <div><span style="color: rgb(127, 127, 127);"><strong><span style="font-size: 15px;"><span data-custom-class="subtitle">Last updated September 06, 2024</span></span></strong></span></div>
            <div><br></div>
            <div><br></div>
            <div><br></div>
            <div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text">This Privacy Notice for <bdt class="question"><a href="https://imagedataextract.com/" target="_blank" data-custom-class="link">https://imagedataextract.com/</a></bdt> ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:</span></span></span></div>
            <ul>
              <li style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Visit our website at <span style="color: rgb(0, 58, 250);"><a href="https://imagedataextract.com" target="_blank" data-custom-class="link">https://imagedataextract.com</a></span>, or any website of ours that links to this Privacy Notice</span></span></span></li>
            </ul>
            <div><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div>
            <ul>
              <li style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Engage with us in other related ways, including any sales, marketing, or events</span></span></span></li>
            </ul>
            <div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span data-custom-class="body_text"><strong>Questions or concerns? </strong>Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <bdt class="question">info@imagedataextract.com</bdt>.</span></span></span></div>
            <div style="line-height: 1.5;"><br></div>
            <div style="line-height: 1.5;"><br></div>
            <div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1">SUMMARY OF KEY POINTS</span></span></strong></div>
            <div style="line-height: 1.5;"><br></div>
            <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><em>This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our </em></strong></span></span><a data-custom-class="link" href="#toc"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><strong><em>table of contents</em></strong></span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><em> below to find the section you are looking for.</em></strong></span></span></div>
            <div style="line-height: 1.5;"><br></div>
            <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about </span></span><a data-custom-class="link" href="#personalinfo"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">personal information you disclose to us</span></span></a><span data-custom-class="body_text">.</span></div>
            <!-- ... (rest of the content) ... -->
          </div>
        ` }} />
      </main>
    </div>
  );
}
