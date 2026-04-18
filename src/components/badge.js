/**
 * Initializes the environment badge if the site is running in a non-production environment.
 */
export function initEnvironmentBadge() {
    const env = import.meta.env.VITE_ENVIRONMENT?.toLowerCase();

    // Don't show the badge in production
    if (!env || env === "production" || env === "prod") {
        return;
    }

    const badge = document.createElement("div");
    badge.className = `environment-badge environment-${env}`;
    badge.textContent = env.toUpperCase();
    badge.title = `Current Environment: ${env.toUpperCase()}`;

    document.body.appendChild(badge);
}
