"use client";
import { ROUTES, SITE } from "@/config/site";
import Link from "next/link";
import { MagicLinkSignIn } from "@/components/MagicLinkSignIn";
import { ArrowBigDown } from "lucide-react";
import { Confetti } from "@/components/Confetti";
import AnimatedCheckbox from "@/components/AnimatedCheckbox";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { type User } from "@prisma/client";

export default function Page() {
  const session = useSession();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    if (session.data && session.data.user) {
      setUser(session.data.user);
    }
  }, [session]);

  return (
    <main className="grow">
      <Confetti />
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pb-12 pt-32 md:pb-20 md:pt-40">
            <div className="mx-auto max-w-3xl text-center">
              <div className="rounded-xl bg-base-200 p-6 md:mx-auto ">
                <AnimatedCheckbox
                  className="mx-auto my-6 h-24 w-24"
                  onLoad={true}
                />
                <div className="text-center">
                  <h3 className="text-center text-base font-semibold md:text-2xl">
                    Payment Done!
                  </h3>
                  <p className="my-2">
                    Thank you for completing your purchase with {SITE.name}.
                  </p>
                  <p> Have a great day! </p>
                </div>
                {user ? (
                  <div className="py-10 text-center">
                    <Link
                      href={ROUTES.subscription.path}
                      className="btn btn-primary"
                    >
                      Go to Home Page
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="divider" />
                    <div className="px-10 pb-4 pt-2 font-medium">
                      A link has been sent to your email address to access your
                      account, if you didn&apos;t receive it, enter the email
                      you used at checkout and click below button to resend
                    </div>

                    <div className="p-10 font-medium">
                      <p className="font-semibold">
                        Get the link to access your account
                      </p>
                      <ArrowBigDown className="mx-auto my-5 animate-bounce text-primary" />
                      <MagicLinkSignIn />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
