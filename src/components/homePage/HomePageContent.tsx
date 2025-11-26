import { useEffect, useState } from "react";
import { useContact } from "../../Hooks/ExampleHook";

const HomePageContent = () => {
    const contact = useContact();
    const [inputValue, setInputValue] = useState("");
    const [deValue, setDeValue] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDeValue(inputValue);
        }, 1000);

        return () => clearTimeout(timer);
    }, [inputValue]);
     const contacts = Array.isArray(contact.data) ? contact.data : [];

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
            <p>Contact: {contacts.length}</p>
            {contacts.map((item: any) =>
                <div key={item.id} className="flex px-20px">
                    {item.id} + {item.email} +{item.phoone} + {item.address}
                </div>

            )}
        </div>
    );
}

export default HomePageContent;