import axios from "axios";
import { useQuery} from "@tanstack/react-query";

const useContact = () => {
    const contact = useQuery({
        queryKey: ['contact'],
        queryFn: async () => {
            console.log(`contact hook called /contact`);
            const response = await axios.get('/api/contact');
            return response.data;
        }
    });
    return contact;
}
export { useContact };