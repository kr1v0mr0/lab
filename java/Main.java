import com.fastcgi.FCGIInterface;
import java.io.*;
import java.lang.reflect.Parameter;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;

public class Main {
    private static final ConcurrentLinkedQueue<RequestResult> resultsHistory = new ConcurrentLinkedQueue<>();
    private static final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final Set<Double> validXValues = Set.of(-5.0, -4.0, -3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0);
    private static final Set<Double> validRValues = Set.of(1.0, 1.5, 2.0, 2.5, 3.0);
    static {try(FileInputStream ins = new FileInputStream("log.config")){
        LogManager.getLogManager().readConfiguration(ins);
    }catch (Exception ignore){
        ignore.printStackTrace();
    }
    }
    public static final Logger LOGGER=Logger.getLogger(Main.class.getName());
    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();
        System.err.println("AreaCheck FastCGI Server started. Waiting for connections...");

        while (fcgi.FCGIaccept() >= 0) {
            try {
                requestHandler();
            } catch (Exception e) {
                LOGGER.log(Level.WARNING, "Error handling request: " + e.getMessage());
            } finally {
                System.getProperties().clear();
            }
        }
    }

    private static void requestHandler() throws IOException{
        long startTime = System.nanoTime();
        Parameters params = new Parameters();

        String requestMethod = System.getProperty("REQUEST_METHOD", "GET");
        String contentType = System.getProperty("CONTENT_TYPE", "");
        String queryString = "";
        if("POST".equalsIgnoreCase(requestMethod) && contentType.startsWith("application/x-www-form-urlencoded")){
            int contentLength = Integer.parseInt(System.getProperty("CONTENT_LENGTH", "0"));
            if (contentLength>0){
                char[] buffer = new char[contentLength];
                int bytesRead = new InputStreamReader(System.in).read(buffer, 0, contentLength);
                queryString = new String(buffer, 0, bytesRead);
            }
            else{
                queryString = System.getProperty("QUERY_STRING", "");
            }
            LOGGER.log(Level.INFO, "Принят запрос: "+requestMethod+"\nContent-type: "+contentType+"\nQuery-string: "+queryString);

            parseParams(params, queryString);
            ValidationResult res = validateParams(params);
            if (!res.status()){
                sendJsonError(res.errorMessage());
                return;
            }
            boolean hit = checkHit(params.x, params.y, params.r);
            long endTime = System.nanoTime();
            double durationMs = (endTime - startTime) / 1_000_000.0;
            String currentTime = LocalDateTime.now().format(timeFormatter);
            RequestResult result = new RequestResult(params.x, params.y, params.r, hit, currentTime, durationMs);
            resultsHistory.add(result);
            while (resultsHistory.size() > 50) {
                resultsHistory.poll();
            }
            sendJsonResponse(result);
        }



    }

    private static void parseParams(Parameters params, String queryString){
        if (queryString==null || queryString.isEmpty()) return;
        String[] pieces = queryString.split("&");
        for (String e: pieces){
            int idx = e.indexOf("=");
            if (idx>0){
                String name = e.substring(0, idx);
                String value = e.substring(idx+1);
                try{
                    switch (name){
                        case "x" -> params.x = Double.parseDouble(value);
                        case "y" -> params.y = Double.parseDouble(value);
                        case "r" -> params.r = Double.parseDouble(value);
                    }
                }
                catch (NumberFormatException ex){

                }
            }


        }
    }

    private static ValidationResult validateParams(Parameters params){
        if (params.r == null) {
            return new ValidationResult(false, "Parameter 'r' is missing or invalid.");
        }
        if (params.x == null) {
            return new ValidationResult(false, "Parameter 'x' is missing or invalid.");
        }
        if (params.y == null) {
            return new ValidationResult(false, "Parameter 'y' is missing or invalid.");
        }

        if (!validXValues.contains(params.x)) {
            return new ValidationResult(false, "Invalid X coordinate. Must be one of: " + validXValues);
        }
        if (params.y <= -5 || params.y >= 5) { // Y вводится вручную, проверяем диапазон
            return new ValidationResult(false, "Y coordinate must be between -5 and 5.");
        }
        if (!validRValues.contains(params.r)) {
            return new ValidationResult(false, "Invalid R value. Must be one of: " + validRValues);
        }
        return new ValidationResult(true, null);

    }

    private static boolean checkHit(double x, double y, double r){
        if (x<=r && x>=0 && y<=0 && y>=-r){
            return true;
        }
        if (x<=0 && x>=(-r/2) && y<=0 && y>=(-r/2) && (x*y*1/2)<=(r*r/8)){
            return true;
        }
        if (x >= 0 && y >= 0 && (x * x + y * y) <= (r * r) / 4) {
            return true;
        }
        return false;
    }

    private static void sendJsonResponse(RequestResult result){
        StringBuilder historyHtml = new StringBuilder();
        for (RequestResult res : resultsHistory) {
            historyHtml.append(String.format("<tr><td>%s</td><td>%s</td><td>%s</td><td class=\"%s\">%s</td><td>%s</td><td>%.2f ms</td></tr>",
                    res.x(), res.y(), res.r(),
                    res.hit() ? "hit" : "miss",
                    res.hit() ? "Попадание" : "Промах",
                    res.currentTime(),
                    res.executionTime()));
        }
        String jsonResponse = String.format(Locale.US,"{" +
                        "\"success\": true, " +
                        "\"result\": {" +
                        "\"x\": %.2f, " +
                        "\"y\": %.2f, " +
                        "\"r\": %.2f, " +
                        "\"hit\": %b, " +
                        "\"currentTime\": \"%s\", " +
                        "\"executionTime\": %.2f" +
                        "}, " +
                        "\"history\": \"%s\"" +
                        "}",
                result.x(), result.y(), result.r(),
                result.hit(),
                result.currentTime(),
                result.executionTime(),
                historyHtml.toString().replace("\"", "\\\"").replace("\n", "\\n")
        );

        System.out.println("Content-Type: application/json; charset=UTF-8");
        System.out.println("Connection: close");
        System.out.println();
        LOGGER.log(Level.INFO, "Отправлен ответ: " + jsonResponse);
        System.out.println(jsonResponse);
    }

    private static void sendJsonError(String message){
        String answer = "{\"success\": false, \"message\": \"" + message.replace("\"", "\\\"") + "\"}";
        System.out.println("Content-Type: application/json; charset=UTF-8");
        System.out.println("Connection: close");
        System.out.println();
        LOGGER.log(Level.INFO, "Отправлен ответ: " + answer);
        System.out.println(answer);

    }



    static class Parameters {
        Double x;
        Double y;
        Double r;
    }


}