import { Link } from "react-router-dom";
import { Link2, AtSign, Briefcase, Sparkles } from "lucide-react";
import { ROUTES } from "@/constants";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to={ROUTES.home} className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              Mallivin Tech<span className="text-gradient">CMS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-text-secondary">
              An event-driven microservices blog platform: auth, posts, taxonomy, comments, and
              notifications, wired together with Kafka and served through a single gateway.
            </p>
            <div className="mt-5 flex gap-3">
              {[Link2, AtSign, Briefcase].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg glass text-text-secondary transition-colors hover:text-text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title="Product"
            links={["Features", "Architecture", "Tech stack", "Changelog"]}
          />
          <FooterColumn title="Platform" links={["Posts", "Categories", "Tags", "Comments"]} />
          <FooterColumn title="Company" links={["About", "Blog", "Careers", "Contact"]} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} MallivinTech CMS. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
