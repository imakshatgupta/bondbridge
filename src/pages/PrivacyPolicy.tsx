import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100vh] relative overflow-y-auto pb-10 league-font">
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

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="h-[200px] bg-[url('/assets/stores/privacy-policy-banner.svg')] flex items-center bg-cover bg-top mb-10">
          <h1 className="flex items-center text-4xl md:text-5xl font-bold gap-3">
            <span className="text-foreground pb-2">Privacy</span>
            <span className="grad pb-2">Policy</span>
          </h1>
        </div>

        <div className="space-y-6 text-foreground text-justify text-sm">
          <p className="leading-relaxed">
            The Officers of BondBridge LLC are firmly committed to guarding the
            confidence you have placed in our company and to use, responsibly
            and professionally, any information you volunteer. We strive to
            collect only that information that we think is necessary for our
            legitimate business interests, such as to better understand you (our
            customer), to provide better service, to improve the marketing our
            products, to educate customers and to ensure that our proprietary
            information is protected. We are committed to using the information
            collected only for these purposes. The protection of privacy and
            personal data is a priority.
          </p>

          <p className="leading-relaxed">
            BondBridge LLC does not rent, sell or lease User Information we have
            collected through our Website. However, we may share User
            Information, collected through our Website, with other BondBridge
            LLC entities or with our direct business partners for research
            purposes and to provide you with updated information that we feel
            would be of benefit to you. Our policy is to give our Users the
            opportunity to opt out of receiving any direct research or marketing
            contact. We have designed this website, our webapplications and
            mobile applications with the same rules and policies in place for a
            secure User experience.
          </p>

          <p className="leading-relaxed">
            Local country laws are applied where they differ from this policy.
            Links to third party websites, from this website, are provided
            solely as convenience for the end user. If these links are Used, the
            User will leave our Website. We have not reviewed, nor do we monitor
            these third party sites and we do not control, nor are we
            responsible for, any of these websites, their content or their
            private policies (if any). This policy discloses our information
            gathering and usage practices for BondBridge's online services.
          </p>

          <p className="leading-relaxed">
            In order to improve our problem resolution process through better
            product and case tracking, BondBridge's tech support department has
            implemented online registration and technical support services. We
            require contact information to identify you and to direct you to the
            proper service. This information is also used to manage your case,
            notify you when necessary of issues related to your transaction.
            Occasionally, we may send e-mails to give customers information we
            think you will find useful, such as information about new features,
            products or promotions.
          </p>

          <p className="leading-relaxed">
            When we contact or e-mail you, we will always provide instructions
            explaining how to unsubscribe so you will not receive and contact or
            any e-mails in the future. You may also opt-out of receiving future
            BondBridge and/or partner communications by submitting your request
            through our online feedback form. We strive to make the BondBridge
            User experience and safe, secure, fulfilling and pleasant one. We
            welcome any and all feedback in regard to how to make our product,
            safer, more secure, more fulfilling and easier to utilize.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Device Permissions and Data Access</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Phone Number Access</h3>
              <p className="leading-relaxed">
                We collect the user's mobile number during the account creation process. This is a crucial step to verify user identity and ensure secure access to the application. The phone number also enables a simplified login process using OTP (One-Time Password) authentication, reducing the risk of unauthorized access. It is stored securely and not shared with any external parties.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Microphone Access</h3>
              <p className="leading-relaxed">
                Microphone access is required to enable the speech-to-text functionality within the app. This feature allows users to convert their voice into written text, enhancing the ease of communication—especially in chat and note-taking features. The microphone is activated only when the user initiates a voice input action, and no background recording is performed.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Camera Access</h3>
              <p className="leading-relaxed">
                We request access to the device's camera to allow users to capture photos and videos directly from the app. This is particularly useful when creating stories, posts, or updating profile pictures. Camera access enhances user engagement by enabling real-time media creation without needing to switch to external apps.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Gallery Access</h3>
              <p className="leading-relaxed">
                Gallery (media storage) access is required to let users upload existing images or videos from their device. This is essential for posting content, sharing visual updates, or changing profile photos. The app only accesses files that the user selects—no other files or folders are browsed or stored.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">OTP Access</h3>
              <p className="leading-relaxed">
                To ensure a seamless and secure login experience, our app uses SMS permission to automatically detect and fill in OTPs (One-Time Passwords) sent during account verification or login. This improves user experience by eliminating the need for manual entry, while also adding a layer of security through timely verification.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Data Usage and Sharing</h3>
              <p className="leading-relaxed">
                BondBridge is committed to safeguarding user privacy. All personal data collected is used strictly for internal purposes such as account management, security, personalization, and service improvement. We do not share, sell, or transfer any user data to third-party entities under any circumstances. Our data handling practices fully comply with applicable privacy regulations, and we take all necessary measures to protect your information.
              </p>
            </div>
          </div>

          <p className="leading-relaxed mt-8">
            Contact Us: If there are any questions or issues regarding this
            website, our practices, or any of our policies, please contact us
            via e-mail at: info@bondbridge.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
