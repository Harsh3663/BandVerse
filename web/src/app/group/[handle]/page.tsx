import {
  PerformerProfilePage,
  profileMetadata,
  profileStaticParams,
  type ProfileRouteProps,
} from "@/features/profiles/performer-profile-page";

export const generateStaticParams = () => profileStaticParams("group");

export const generateMetadata = (props: ProfileRouteProps) =>
  profileMetadata("group", props);

export default function GroupProfilePage(props: ProfileRouteProps) {
  return <PerformerProfilePage routeKind="group" {...props} />;
}
