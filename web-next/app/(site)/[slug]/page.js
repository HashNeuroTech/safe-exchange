import Link from "next/link";
import { notFound } from "next/navigation";
import { footerSections, getAllStaticSlugs, getPageBySlug } from "../../../lib/site/pages";

export function generateStaticParams() {
  return getAllStaticSlugs().map(({ slug }) => ({ slug: slug[0] }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const page = getPageBySlug([resolvedParams?.slug]);

  if (!page) {
    return {
      title: "SafeExchange",
    };
  }

  return {
    title: `${page.title} | SafeExchange`,
    description: page.summary,
  };
}

export default async function SitePage({ params }) {
  const resolvedParams = await params;
  const page = getPageBySlug([resolvedParams?.slug]);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#051124] text-white">
      <main className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-blue-500">{page.eyebrow}</p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">{page.title}</h1>
            <p className="mt-5 text-sm leading-7 text-slate-400 md:text-base">{page.summary}</p>
          </div>

          {(page.primaryAction || page.secondaryAction) && (
            <div className="flex flex-wrap gap-3">
              {page.primaryAction ? (
                <Link
                  href={page.primaryAction.href}
                  className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_22px_rgba(37,99,235,0.28)] transition hover:bg-blue-500"
                >
                  {page.primaryAction.label}
                </Link>
              ) : null}
              {page.secondaryAction ? (
                <Link
                  href={page.secondaryAction.href}
                  className="rounded border border-blue-800 bg-blue-950/30 px-4 py-2 text-xs font-bold text-blue-200 transition hover:border-blue-500"
                >
                  {page.secondaryAction.label}
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <section className="mb-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {page.highlights.map((item) => (
            <div key={item} className="rounded border border-blue-900/40 bg-[#08162d] p-4">
              <div className="mb-3 h-1 w-8 rounded bg-blue-500" />
              <p className="text-sm font-bold text-blue-100">{item}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <article className="space-y-6">
            {page.sections.map((section) => (
              <section key={section.heading} id={section.anchor} className="rounded border border-blue-900/35 bg-[#08162d]/72 p-6">
                <h2 className="mb-3 text-lg font-black text-white">{section.heading}</h2>
                <p className="text-sm leading-7 text-slate-400">{section.body}</p>
                {section.items ? (
                  <ul className="mt-5 grid gap-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {page.notice ? (
              <section className="rounded border border-yellow-500/20 bg-yellow-500/8 p-5">
                <p className="text-xs leading-6 text-yellow-100/80">{page.notice}</p>
              </section>
            ) : null}
          </article>

          <aside className="h-fit rounded border border-blue-900/40 bg-[#08162d] p-5">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-blue-500">页面导航</p>
            <nav className="space-y-6">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 text-xs font-bold text-slate-500">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-slate-300 transition hover:text-blue-300">
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      </main>
    </div>
  );
}
