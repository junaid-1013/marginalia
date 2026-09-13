export interface ITeamMember {
  name: string;
  github: string;
  linkedin: string;
  website: string;
}

// the avatars are read from GitHub at runtime (see TeamAvatar), so nothing else is stored here
export const TEAM: ITeamMember[] = [
  {
    name: "Junaid Ali Bhatti",
    github: "https://github.com/junaid-1013",
    linkedin: "https://www.linkedin.com/in/junaid-ali-bhatti-101452/",
    website: "https://junaidalibhatti.vercel.app",
  },
  {
    name: "Muhammad Junaid Iqbal",
    github: "https://github.com/JuGit-pk",
    linkedin: "https://www.linkedin.com/in/junaidi2k1/",
    website: "https://junaidi2k1.vercel.app",
  },
];
