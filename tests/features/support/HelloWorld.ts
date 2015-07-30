export class HelloWorld {
	defaultPersonToGreet : string = "Clint Eastwood";
	public greet(whom) {
		return "Hello " + whom || this.defaultPersonToGreet;
	}
}