export interface IProject {
    // The name of the project
    name: string;

    data: IProjectData | IProjectData[]

}


export interface IProjectData {
    encrypted_secret: string;
    commands: string[];
    environment: string;
}