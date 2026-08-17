import {
  PerformerProfilePage,
  profileMetadata,
  profileStaticParams,
  type ProfileRouteProps,
} from "@/features/profiles/performer-profile-page";

export const generateStaticParams = () => profileStaticParams("artist");

export const generateMetadata = (props: ProfileRouteProps) =>
  profileMetadata("artist", props);

export default function ArtistProfilePage(props: ProfileRouteProps) {
  return <PerformerProfilePage routeKind="artist" {...props} />;
}
