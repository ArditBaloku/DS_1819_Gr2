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
            var morseChar = new Dictionary<char, string>()
            {
                {'A', ".-"},
                {'B', "-..."},
                {'C', "-.-."},
                {'D', "-.."},
                {'E', "."},
                {'F', "..-."},
                {'G', "--."},
                {'H', "...."},
                {'I', ".."},
                {'J', ".---"},
                {'K', "-.-"},
                {'L', ".-.."},
                {'M', "--"},
                {'N', "-."},
                {'O', "---"},
                {'P', ".--."},
                {'Q', "--.-"},
                {'R', ".-."},
                {'S', "..."},
                {'T', "-"},
                {'U', "..-"},
                {'V', "...-"},
                {'W', ".--"},
                {'X', "-..-"},
                {'Y', "-.--"},
                {'Z', "--.."},
                {'1', ".----"},
                {'2', "..---"},
                {'3', "...--"},
                {'4', "....-"},
                {'5', "....."},
                {'6', "-...."},
                {'7', "--..."},
                {'8', "---.."},
                {'9', "----."},
                {'0', "-----"},
                {' ', "/"},
            };

            if (args.Length > 0)
            {
                if (args[0] == "encode")
                {
                    Console.WriteLine(Encode(string.Join(" ", args.Skip(1)), morseChar));
                }
                else if (args[0] == "decode")
                {
                    Console.WriteLine(Decode(string.Join(" ", args.Skip(1)), morseChar));
                }
                else if (args[0] == "beep")
                {
                    BeepBoop(Encode(string.Join(" ", args.Skip(1)), morseChar));
                }
            }
        }
        static string Encode(string message, Dictionary<char, string> dict)
        {
            char[] charArr = message.ToUpper().ToCharArray();
            string encoded = "";
            for (int i = 0; i < message.Length; i++)
            {
                try
                {
                    encoded += dict[charArr[i]];
                    encoded += " ";
                }
                catch (Exception e)
                {
                    Console.WriteLine("Invalid character(s)");
                }
            }
            return encoded;
        }
        static string Decode(string message, Dictionary<char, string> dict)
        {
            string[] stringArr = message.Split();
            string decoded = "";
            for (int i = 0; i < stringArr.Length; i++)
            {
                var letter = dict.FirstOrDefault(x => x.Value == stringArr[i]).Key;
                decoded += letter;
            }
            return decoded;
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
