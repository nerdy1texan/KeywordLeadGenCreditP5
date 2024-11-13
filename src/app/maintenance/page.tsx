import SocialLinks from "@/components/SocialLinks";
import "@/styles/global.css";

export default function Maintenance() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <img src={"/logo_dark.svg"} alt="Logo" className="mb-8 h-10" />
          <h1 className="h1 mb-4 text-center text-4xl font-bold">
            Site is under maintenance
          </h1>
          <p className="mb-8 text-center text-lg text-gray-500 md:text-xl lg:text-2xl">
            We&apos;re working hard to improve the user experience. Stay tuned!
          </p>
          <SocialLinks />
        </div>
      </body>
    </html>
  );
}
