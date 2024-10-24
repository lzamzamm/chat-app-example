import React, { useEffect, useRef, useState } from "react";
import Message from "./Message.jsx";
import MessageInput from "./MessageInput.jsx";

const ChatBox = ({ rootUrl }) => {
    const userData = document.getElementById("main").getAttribute("data-user");

    const user = JSON.parse(userData);
    // `App.Models.User.${user.id}`;
    const webSocketChannel = `channel_for_everyone`;

    const [messages, setMessages] = useState([]);
    const scroll = useRef();

    const scrollToBottom = () => {
        scroll.current.scrollIntoView({ behavior: "smooth" });
    };

    const connectWebSocket = () => {
        console.log("Connecting to WebSocket...");
        try {
            window.Echo.private(webSocketChannel).listen(
                "GotMessage",
                async (e) => {
                    console.log("New message event received", e);
                    await getMessages();
                }
            );
        } catch (e) {
            console.log(e);
        }
    };

    const getMessages = async () => {
        try {
            const m = await axios.get({
                url: `${rootUrl}/messages`,
                withCredentials: true,
            });
            // console.log(m);
            setMessages(m.data);
            console.log("messages updated", m.data);
            setTimeout(scrollToBottom, 0);
        } catch (err) {
            console.log(err.message);
        }
    };

    useEffect(() => {
        getMessages();
        connectWebSocket();

        return () => {
            window.Echo.leave(webSocketChannel);
        };
    }, [getMessages]);

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header">Chat Box</div>
                    <div
                        className="card-body"
                        style={{ height: "500px", overflowY: "auto" }}
                    >
                        {messages?.map((message) => (
                            <Message
                                key={message.id}
                                userId={user.id}
                                message={message}
                            />
                        ))}
                        <span ref={scroll}></span>
                    </div>
                    <div className="card-footer">
                        <MessageInput rootUrl={rootUrl} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
