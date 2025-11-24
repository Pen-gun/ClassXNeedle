import NavBar from "./navBar/NavBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <NavBar />
            <main>{children}</main>
        </>
    );
}

export default Layout;