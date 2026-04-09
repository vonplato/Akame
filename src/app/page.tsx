import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AF</span>
            </div>
            <span className="text-xl font-bold">Akame Floor</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Identify Any Floor
            <br />
            <span className="text-blue-600">In Seconds</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Snap a photo, get instant AI-powered identification with material
            details, condition assessment, and cost estimates. Built for
            construction professionals.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              title="Instant Identification"
              description="AI identifies floor type, species, and material from a single photo. Supports hardwood, tile, vinyl, stone, carpet, and more."
            />
            <FeatureCard
              title="Condition Assessment"
              description="Get an objective rating of floor condition with damage type detection — water damage, scratches, warping, and 15+ categories."
            />
            <FeatureCard
              title="Cost Estimates"
              description="Material and labor cost ranges per square foot, adjusted for your region. Customize with your company's own rates."
            />
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 py-8 text-center text-sm text-gray-500">
        Akame Floor &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}
