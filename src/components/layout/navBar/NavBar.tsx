

const NavBar = () => {
    return (
        <nav>
            <ul className="flex space-x-4 p-4 bg-gray-800 text-white">
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
            </ul>
        </nav>
    );
}

export default NavBar;