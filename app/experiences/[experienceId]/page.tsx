import { whopApi } from "@/lib/whop-api";
import { verifyUserToken } from "@whop/api";
import { headers } from "next/headers";

import ExperienceHome from "@/components/experience-home";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  // The headers contains the user token
  const headersList = await headers();

  // The experienceId is a path param
  const { experienceId } = await params;

  // The user token is in the headers
  const { userId } = await verifyUserToken(headersList);

  const result = await whopApi.checkIfUserHasAccessToExperience({
    userId,
    experienceId,
  });

  const user = (await whopApi.getUser({ userId })).publicUser;
  const experience = (await whopApi.getExperience({ experienceId })).experience;

  const companyId = experience.company.id;

  // Either: 'admin' | 'customer' | 'no_access';
  // 'admin' means the user is an admin of the whop, such as an owner or moderator
  // 'customer' means the user is a common member in this whop
  // 'no_access' means the user does not have access to the whop
  const { accessLevel } = result.hasAccessToExperience;

  return (
	<div className="flex flex-col gap-4 p-4 h-screen items-center justify-center">
      <ExperienceHome
        accessLevel={accessLevel}
        experienceId={experienceId}
      />
    </div>
  );
}
