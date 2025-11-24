import { useEffect, useState } from "react";

const HomePageContent = () => {
    const [inputValue, setInputValue] = useState("");
    const [deValue, setDeValue] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDeValue(inputValue);
        }, 1000);

        return () => clearTimeout(timer);
    }, [inputValue]);

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <p>This is the main content of the home page.</p>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type something..."
            />
            <p>You typed: {inputValue}</p>
            <p>Debounced value (1s delay): {deValue}</p>
        </div>
    );
}

export default HomePageContent;