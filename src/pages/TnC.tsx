import React from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const TnC: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100vh] relative overflow-y-auto pb-10 text-justify league-font">
      {/* Background shape */}
      <div className="absolute right-0 top-0 w-2/3 h-full bg-gradient-to-br from-blue-50 to-gray-100 rounded-bl-[100%] -z-10"></div>

      {/* Back button */}
      <button
        onClick={() => navigate("/signup")}
        className="absolute top-6 left-6 flex items-center gap-1 text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="h-[200px] bg-[url('/assets/stores/privacy-policy-banner.svg')] flex items-center bg-cover bg-top mb-10">
          <h1 className="flex items-center text-4xl md:text-5xl font-bold">
            <span className="text-foreground">Terms &&nbsp;</span>{" "}
            <span className="grad">Conditions</span>
          </h1>
        </div>

        <div className="space-y-6 text-foreground">
          <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
          <p className="leading-relaxed">
            The services that BondBridge provides to all users are subject to
            the following Terms of Use ("TOU"). BondBridge reserves the right to
            update and modify the TOU at any time without notice. The most
            current version of the TOU can be reviewed by clicking on the "Terms
            of Use" hypertext link located at the bottom of our Web pages. When
            we make updates to the TOU, BondBridge will update the date at the
            top of this page. By using the website after a new version of the
            TOU has been posted, you agree to the terms of such new version.
          </p>

          <h2 className="text-2xl font-semibold">Description of Services</h2>
          <p className="leading-relaxed">
            Through its network of Web properties, BondBridge provides you with
            access to a variety of resources, including applications, download
            areas, communication forums and product information (collectively
            "Services"). The Services, including any updates, enhancements, new
            features, and/or the addition of any new Web properties, are subject
            to this TOU.
          </p>

          <h2 className="text-2xl font-semibold">
            Personal and Non-Commercial Use Limitation
          </h2>
          <p className="leading-relaxed">
            Unless otherwise specified, the Services are for your personal and
            non-commercial use. You may not modify, copy, distribute, transmit,
            display, perform, reproduce, publish, license, create derivative
            works from, transfer, or sell any information, software, products or
            services obtained from the Services.
          </p>

          <h2 className="text-2xl font-semibold">
            Privacy and Protection of Personal Information
          </h2>
          <p className="leading-relaxed">
            See the{" "}
            <Link
              to="/privacy"
              className="text-primary hover:text-primary/80 underline"
            >
              Privacy Statement
            </Link>{" "}
            disclosures relating to the collection and use of your personal data.
          </p>

          <h2 className="text-2xl font-semibold">Content</h2>
          <p className="leading-relaxed">
            All content included in or made available through the Services is
            the exclusive property of BondBridge or its content suppliers and is
            protected by applicable intellectual property laws. All rights not
            expressly granted are reserved and retained by BondBridge or its
            licensors.
          </p>

          <h2 className="text-2xl font-semibold">Software</h2>
          <p className="leading-relaxed">
            Any software available through the Services is copyrighted by
            BondBridge and/or its suppliers. Use of the Software is governed by
            the end user license agreement. Unauthorized reproduction or
            redistribution is prohibited by law and may result in legal
            penalties.
          </p>

          <h2 className="text-2xl font-semibold">Restricted Rights Legend</h2>
          <p className="leading-relaxed">
            Software downloaded for or on behalf of the U.S. Government is
            provided with Restricted Rights as defined in applicable federal
            regulations. Manufacturer is BondBridge Corporation, One BondBridge
            Way, Redmond, WA 98052-6399.
          </p>

          <h2 className="text-2xl font-semibold">Documents</h2>
          <p className="leading-relaxed">
            Permission is granted to use Documents from the Services for
            non-commercial or personal use under specific conditions.
            Educational institutions may use them for classroom distribution.
            Any other use requires written permission.
          </p>
          <p className="leading-relaxed">
            These permissions do not include website design or layout elements,
            which may not be copied or imitated without express permission.
          </p>

          <h2 className="text-2xl font-semibold">
            Representations and Warranties
          </h2>
          <p className="leading-relaxed">
            Software and tools are provided "as is" without warranties except as
            specified in the license agreement. BondBridge disclaims all other
            warranties including merchantability and fitness for a particular
            purpose.
          </p>

          <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
          <p className="leading-relaxed">
            BondBridge is not liable for any damages resulting from the use or
            inability to use the Services, including software, documents, or
            data.
          </p>

          <h2 className="text-2xl font-semibold">
            Member Account, Password, and Security
          </h2>
          <p className="leading-relaxed">
            You are responsible for maintaining the confidentiality of your
            account credentials and all activities that occur under your
            account. Unauthorized use must be reported immediately.
          </p>

          <h2 className="text-2xl font-semibold">
            No Unlawful or Prohibited Use
          </h2>
          <p className="leading-relaxed">
            You agree not to use the Services for unlawful purposes or in ways
            that impair, disable, or damage the Services or interfere with
            others' use.
          </p>

          <h2 className="text-2xl font-semibold">Use of Services</h2>
          <p className="leading-relaxed">
            The Services may include communication tools. You agree to use them
            only to post and share appropriate, lawful content. Examples of
            prohibited actions include spamming, harassment, uploading viruses,
            and violating others' rights.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>No spamming or chain messages</li>
            <li>No harassment or privacy violations</li>
            <li>No posting inappropriate or unlawful content</li>
            <li>No distribution of protected content without rights</li>
            <li>No uploading of harmful software</li>
            <li>No unauthorized advertising</li>
            <li>No downloading of content that cannot be legally shared</li>
            <li>No deletion of copyright or source information</li>
            <li>No obstruction of others' use of services</li>
            <li>No identity falsification</li>
            <li>No unlawful activity or violations of conduct codes</li>
          </ul>
          <p className="leading-relaxed">
            BondBridge may remove content or suspend access at its discretion
            and is not responsible for content shared by users. Use caution when
            sharing personal information.
          </p>

          <h2 className="text-2xl font-semibold">AI Services</h2>
          <p className="leading-relaxed">
            AI Services may not be reverse engineered or used for scraping or
            training other AI systems. BondBridge monitors inputs and outputs to
            prevent abuse. Users are responsible for legal compliance and
            third-party claims related to AI use.
          </p>

          <h2 className="text-2xl font-semibold">
            Materials Provided to BondBridge
          </h2>
          <p className="leading-relaxed">
            By submitting content, you grant BondBridge the rights to use it in
            connection with its Services. No compensation is provided. You must
            own or have permission to share submitted content, including images.
          </p>

          <h2 className="text-2xl font-semibold">Copyright Infringement</h2>
          <p className="leading-relaxed">
            To report copyright violations, follow the procedures under Title
            17, U.S. Code, Section 512(c)(2). Non-relevant inquiries will not
            receive responses.
          </p>

          <h2 className="text-2xl font-semibold">Links to Third Party Sites</h2>
          <p className="leading-relaxed">
            Linked third-party websites are not under BondBridge's control.
            BondBridge is not responsible for their content or transmissions.
            Links are provided for convenience, not endorsement.
          </p>

          <h2 className="text-2xl font-semibold">
            Unsolicited Idea Submission Policy
          </h2>
          <p className="leading-relaxed">
            BondBridge does not accept unsolicited ideas. If submitted, such
            materials are not treated as confidential or proprietary. This
            policy prevents disputes over similar ideas developed by BondBridge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TnC;
