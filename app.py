from flask import Flask, render_template, request, jsonify
from yahoofinancials import YahooFinancials

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')


# API endpoint to get current price for a symbol
@app.route('/api/price')
def get_price():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({'error': 'No symbol provided'}), 400
    try:
        yf = YahooFinancials(symbol)
        price = yf.get_current_price()
        print(f"Current price for {symbol}: {price}")
        return jsonify({'price': price})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API endpoint to lookup a stock symbol (returns basic info)
@app.route('/api/lookup')
def lookup_symbol():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    try:
        # Try to get info for the query as a symbol
        yf = YahooFinancials(query)
        info = yf.get_stock_price_data()
        if info and query in info:
            name = info[query].get('shortName') or info[query].get('longName') or ''
            return jsonify({'symbol': query, 'name': name})
        else:
            return jsonify({'error': 'Symbol not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
