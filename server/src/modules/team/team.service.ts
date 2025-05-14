import { z } from "zod";
import { TeamSchema } from "../../common/validators/team.validator";

export class TeamService {
    public async createTeam(teamData: z.infer<typeof TeamSchema>): Promise<void> {
        console.log("Team created:", teamData);
    }
}