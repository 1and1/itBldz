export class HelloWorld {
	defaultPersonToGreet : string = "Clint Eastwood";
	public greet(whom) {
		if (!whom) whom = this.defaultPersonToGreet;
		return "echo Hello " + whom;
	}
}