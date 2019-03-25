using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Quobject.SocketIoClientDotNet.Client;
using Newtonsoft.Json;

public class ChatData
{
    public string id;
    public string msg;
};

public class socketHandler : MonoBehaviour
{
    public string serverURL = "https://hackbox-backend.herokuapp.com/";

    //public InputField uiInput = null;
    //public Button uiSend = null;
    //public Text uiChatLog = null;

    protected Socket socket = null;
    protected List<string> chatLog = new List<string>();

    void Destroy()
    {
        // DoClose();
    }

    // Use this for initialization
    void Start()
    {
        DoOpen();


    }
    //// Update is called once per frame
    //void Update()
    //{
    //    lock (chatLog)
    //    {
    //        if (chatLog.Count > 0)
    //        {
    //            string str = uiChatLog.text;
    //            foreach (var s in chatLog)
    //            {
    //                str = str + "\n" + s;
    //            }
    //            uiChatLog.text = str;
    //            chatLog.Clear();
    //        }
    //    }
    //}
    void DoOpen()
    {
        if (socket == null)
        {
            socket = IO.Socket(serverURL);
            socket.On(Socket.EVENT_CONNECT, () => {
                socket.Emit("request room");
                socket.On("request room", (data) =>
                {
                    string roomcode = data.ToString();
                    print(roomcode);
                });

            });

        }
    }

    //void DoClose()
    //{
    //    if (socket != null)
    //    {
    //        socket.Disconnect();
    //        socket = null;
    //    }
    //}

    //void SendChat(string str)
    //{
    //    if (socket != null)
    //    {
    //        socket.Emit("chat", str);
    //    }
    //}
}
