export interface IProject {
    // The name of the project
    name: string;

    data: IProjectData | IProjectData[]

}


export interface IProjectData {
    secret: string;
    scripts: {
        pre?: string[];
        main: string[]
        on_success?: string[];
        on_failure?: string[];
        finally?: string[];
    };
    environment_variables?: {
        [key: string]: string
    }
    environment?: string;
}