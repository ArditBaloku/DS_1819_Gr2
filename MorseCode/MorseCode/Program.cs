using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MorseCode
{
    class Program
    {
        static void Main(string[] args)
        {

        }

        static void BeepBoop(string message)
        {
            int freq = 800;
            int timeUnit = 250;
            int dot = timeUnit;
            int dash = timeUnit * 3;
            int charPause = timeUnit;
            int wordPause = timeUnit * 3;

            for (int i = 0; i < message.Length; i++)
            {
                if (message[i] == '.')
                    Console.Beep(freq, dot);
                else if (message[i] == '-')
                    Console.Beep(freq, dash);
                else if (message[i] == ' ')
                    Thread.Sleep(charPause);
                else if (message[i] == '/')
                    Thread.Sleep(wordPause - 2 * charPause);
                else
                    Console.WriteLine("Invalid character");
            }
        }
    }
}
