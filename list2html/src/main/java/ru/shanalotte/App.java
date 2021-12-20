package ru.shanalotte;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class App
{

    public static void generateListWithPrefix(String prefix){
        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(new FileInputStream("list.txt")));
            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream("list_formatted.txt")));

            List<String> headerStrings = new ArrayList<>();

            headerStrings.add("<h2>Playthrough Checklist <span id=\"" + prefix + "_overall_total\"></span></h2>");
            headerStrings.add("<ul>");

            List<String> contentStrings = new ArrayList<>();

            int categoryIndex = 0;
            int itemIndex = 1;
            boolean firstCategoryFound = false;
            boolean emptyStringFound = false;
            String line = null;
            while ((line = in.readLine()) != null)
            {
                line = line.trim();
                if (line.isEmpty()){
                    emptyStringFound = true;
                    continue;
                }

                //найдена категория
                if (line.startsWith("[") && line.endsWith("]")){
                    categoryIndex++;
                    itemIndex = 1;
                    if (firstCategoryFound) contentStrings.add("</ul>");
                    firstCategoryFound = true;

                    String locationName = line.substring(1, line.length() - 1);
                    line = line.replace("[", "<h3>");
                    line = line.replace("]", "<span id=\"" + prefix + "_totals_" + categoryIndex + "\"></span></h3>");
                    contentStrings.add("<a name=\"" + locationName.replace(" ", "_") + "\"></a>");
                    contentStrings.add(line);
                    contentStrings.add("<ul>");
                    headerStrings.add("<li><a href=\"#" + locationName.replace(" ", "_")+ "\">" + locationName + "</a><span id=\""+ prefix + "_nav_totals_" + categoryIndex + "\"></span></li>");
                }
                else
                {
                    if (emptyStringFound){
                        //Название категории предметов
                        contentStrings.add("<h4>" + line + "</h4>");
                    }
                    else
                    {
                        String l = "  <li data-id=\"" + prefix + "_" + categoryIndex + "_" + itemIndex + "\"> " + line + " </li>";
                        if (l.contains("(")){
                            l = l.replace("(", "<span class=\"badge badge-pill badge-danger\">");
                            l = l.replace(")", "</span>");
                        }
                        contentStrings.add(l);
                        itemIndex++;
                    }
                }

                emptyStringFound = false;

            }
            headerStrings.add("</ul>");
            for (String s : headerStrings){
                out.write(s + '\n');
            }
            for (String s : contentStrings){
                out.write(s + '\n');
            }
            out.close();
            in.close();

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main( String[] args )
    {
        //generateListWithPrefix("playthrough");
        generateListWithPrefix("checklist");
    }
}
