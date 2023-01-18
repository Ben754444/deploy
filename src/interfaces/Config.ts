export interface IConfig {
    // The port to run the server on
    port: number;
    // The host to run the server on
    host: string;
    // Whether the server is in production mode
    production: boolean;
    // Whether to hide the presence of projects (will always return 404 unless all data is correct)
    hide_projects: boolean;
    // The prefix for user supplied environment variables (to avoid collisions)
    environment_variables_prefix: string;
}