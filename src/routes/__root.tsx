import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode, createContext, useContext } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useTheme } from "../hooks/use-theme";

type ThemeContextType = ReturnType<typeof useTheme>;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Love Restaurant — Cocina romántica en Villavicencio, Meta" },
      {
        name: "description",
        content:
          "Love Restaurant en Villavicencio: el rincón más romántico del Meta. Cenas bajo el árbol de cerezo rosa, cócteles de autor y momentos inolvidables.",
      },
      { name: "author", content: "Love Restaurant" },
      {
        property: "og:title",
        content: "Love Restaurant — Cocina romántica en Villavicencio, Meta",
      },
      {
        property: "og:description",
        content:
          "Love Restaurant en Villavicencio: el rincón más romántico del Meta. Cenas bajo el árbol de cerezo rosa, cócteles de autor y momentos inolvidables.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Love Restaurant — Cocina romántica en Villavicencio, Meta",
      },
      {
        name: "twitter:description",
        content:
          "Love Restaurant en Villavicencio: el rincón más romántico del Meta. Cenas bajo el árbol de cerezo rosa, cócteles de autor y momentos inolvidables.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/72c5d7ef-261b-4409-8f17-96e6856480a5/id-preview-c6fbc319--81628492-0f59-41f8-8211-0fb1e0590d43.lovable.app-1782863160280.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/72c5d7ef-261b-4409-8f17-96e6856480a5/id-preview-c6fbc319--81628492-0f59-41f8-8211-0fb1e0590d43.lovable.app-1782863160280.png",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&family=Dancing+Script:wght@600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme-preference') || 'auto';
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const effectiveTheme = theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme;
                  
                  if (effectiveTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const themeValue = useTheme();

  // Asegurar que el tema se aplique al iniciar
  useEffect(() => {
    // Aplicar tema inmediatamente
    const html = document.documentElement;
    const effectiveTheme = themeValue.theme === "auto" 
      ? themeValue.systemTheme 
      : themeValue.theme;

    if (effectiveTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [themeValue]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={themeValue}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}
