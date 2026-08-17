import {
  PerformerProfilePage,
  profileMetadata,
  profileStaticParams,
  type ProfileRouteProps,
} from "@/features/profiles/performer-profile-page";

export const generateStaticParams = () => profileStaticParams("band");

export const generateMetadata = (props: ProfileRouteProps) =>
  profileMetadata("band", props);

export default function BandProfilePage(props: ProfileRouteProps) {
  return <PerformerProfilePage routeKind="band" {...props} />;
}
