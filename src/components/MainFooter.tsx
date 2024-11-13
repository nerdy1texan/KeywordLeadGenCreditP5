import { MENUS, ROUTES, SITE } from "@/config/site";
import { Logo } from "@/components/MonochromeLogo";
import { getAllPublishedPages } from "@/lib/cms";
import Newsletter from "@/components/Newsletter";
import { getDictionary } from "@/dictionaries";
import SocialLinks from "@/components/SocialLinks";

export default async function MainFooter() {
  const t = (await getDictionary())["Common"];
  const { pages } = await getAllPublishedPages();
  return (
    <footer className="bg-base-200/20 py-10 sm:pt-16 lg:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-12 gap-y-16 md:col-span-3 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-3 lg:col-span-2 lg:pr-8">
            <Logo size={25} />

            <p className="mt-7 text-base leading-relaxed text-slate-400">
              {SITE.description}
            </p>

            <SocialLinks />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              {t["Resources"]}
            </p>

            <ul className="mt-6 space-y-4">
              {MENUS.footNavigation.map((menu, index) => (
                <li key={index}>
                  <a
                    href={menu.path}
                    className="font-medium text-gray-500 hover:text-primary"
                  >
                    {(t as any)[menu.title]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              {t["Pages"]}
            </p>

            <ul className="mt-6 space-y-4">
              {pages.map((page, index) => (
                <li key={index}>
                  <a
                    href={ROUTES.pages.path + "/" + page.slug}
                    className="font-medium text-gray-500 hover:text-primary"
                  >
                    {(t as any)[page.title]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-2 lg:pl-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              {t["Subscribe to newsletter"]}
            </p>
            <div className="mt-6">
              <Newsletter />
            </div>
          </div>
        </div>

        <hr className="border-color mb-10 mt-16 border" />

        <p className="mt-8 text-center">
          <span className="mx-auto mt-2 text-sm text-gray-500">
            {t["Copyright"]} © {new Date().getFullYear()}
            <a
              href={SITE.url}
              className="mx-2 text-primary hover:text-gray-500"
              rel="noopener noreferrer"
            >
              {SITE.name}
            </a>
          </span>
        </p>
        <div className="mt-8 flex justify-center">
          {/* <button className="text-neutarl-700 flex gap-2 rounded-md border border-base-content bg-base-100 px-4 py-2 text-sm transition duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
            <p className="font-medium">Built with</p> <Logo size={20} />
          </button> */}
        </div>
      </div>
    </footer>
  );
}