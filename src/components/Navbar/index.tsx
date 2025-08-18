import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";

export default function Navbar() {
  const { loginWithRedirect, user, isAuthenticated, logout } = useAuth0();

  return (
    <nav className="fixed top-0 h-16 bg-background border dark:border-slate-700/70 w-screen">
      <div className="h-full flex items-center justify-between mx-auto px-4">
        <img src={"/MOCBOT_trans.png"} alt="Logo" className="h-[70%] pb-1" />
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Avatar>
              <AvatarImage src={user?.picture} />
            </Avatar>
          )}
          {isAuthenticated ? (
            <Button
              variant="default"
              className="rounded-full hover:cursor-pointer"
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="default"
              className="rounded-full hover:cursor-pointer"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: {
                    connection: "discord",
                  },
                })
              }
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
