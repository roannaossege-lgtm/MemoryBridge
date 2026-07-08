import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "";
  } catch {
    return "";
  }
});

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Home,
});

function Home() {
  const businessName = Route.useLoaderData();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        Coming soon
      </span>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
        {businessName || "MemoryBridge"}
      </h1>
      <p className="max-w-xl text-lg text-gray-600 dark:text-gray-400">
        A simple smartphone app that helps people with memory issues stay
        oriented, safe, and connected to loved ones. Family members can remotely
        configure and monitor the app — even from across town.
      </p>
      <div className="grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
            🧭 Stay Oriented
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Daily schedule, time &amp; date reminders, photo-based contact
            dialing
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
            🔔 Stay Safe
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Medication reminders, location alerts, and geo-fence notifications
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
            📱 Simple &amp; Clear
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Large text, high contrast, no complex menus — designed for memory
            care
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
            👨‍👩‍👧 Family Control
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Caregiver dashboard to manage schedules, contacts, and alerts
            remotely
          </p>
        </div>
      </div>
      <footer className="absolute bottom-6 flex flex-col items-center gap-2 text-sm text-gray-400 dark:text-gray-600">
        <span>
          Built with{" "}
          <a
            href="https://cto.new"
            className="underline hover:text-gray-600 dark:hover:text-gray-400"
          >
            cto.new
          </a>
        </span>
      </footer>
    </main>
  );
}
